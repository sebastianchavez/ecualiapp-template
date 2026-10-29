"""Optional authoring tool. Generate static MP3 narration with a Latin Spanish neural voice.
Requires edge-tts and mutagen only when regenerating, never in the website.
Original demonstration text is sent to Microsoft Edge's online speech service.
"""
import argparse
import asyncio
import json
from pathlib import Path
import edge_tts
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parents[1]

async def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--voice',default='es-MX-DaliaNeural')
    parser.add_argument('--rate',default='-10%')
    args=parser.parse_args()
    content=json.loads((ROOT/'tools/sample-content.json').read_text())
    staging=ROOT/'assets/audio/.neural-staging'
    staging.mkdir(parents=True,exist_ok=True)
    semaphore=asyncio.Semaphore(2)
    async def generate(book_id,index,chapter):
        async with semaphore:
            path=staging/f'{book_id}-{index+1}.mp3'
            text=chapter['title']+'.\n\n'+chapter['text']
            await edge_tts.Communicate(text,args.voice,rate=args.rate).save(str(path))
            duration=MP3(path).info.length
            if duration < 20 or path.stat().st_size < 10000:
                raise RuntimeError(f'Invalid generated audio: {path.name}')
            chapter['audio']=f'./assets/audio/{path.name}'
            chapter['duration']=round(duration,3)
            print(f'{path.name}: {duration:.1f}s',flush=True)
    await asyncio.gather(*(generate(id,i,ch) for id,chapters in content['samples'].items() for i,ch in enumerate(chapters)))
    # Do not replace the current audio or metadata until every new chapter is valid.
    for path in staging.glob('*.mp3'):
        path.replace(ROOT/'assets/audio'/path.name)
    staging.rmdir()
    script='/* Original demonstration texts, narrated with '+args.voice+' (neural TTS). */\n'
    script+='const bookSamples = '+json.dumps(content['samples'],ensure_ascii=False,indent=2)+';\n'
    new_books=[]
    for b in content['books']:
        new_books.append({**{k:v for k,v in b.items() if k not in ['color','accent','symbol']},'author':'Ecualiapp · Relato original','narrator':'Dalia · Español latino','cover':f"./assets/{b['id']}.svg",'duration':max(1,round(sum(c['duration'] for c in content['samples'][b['id']])/60)),'rating':'Nuevo','progress':0,'downloaded':False,'favorite':False,'isExample':True})
    script+='books.unshift(...'+json.dumps(new_books,ensure_ascii=False,indent=2)+');\n'
    (ROOT/'js/data/samples.js').write_text(script)
    (ROOT/'assets/audio/voice.json').write_text(json.dumps({'engine':'Microsoft neural TTS','voice':args.voice,'language':'es-MX','rate':args.rate,'chapters':sum(map(len,content['samples'].values()))},indent=2)+'\n')
    print('All neural samples generated successfully.',flush=True)

if __name__=='__main__':
    asyncio.run(main())
