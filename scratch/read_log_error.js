const fs = require('fs');

const logPath = '/Users/shoaib/.gemini/antigravity-ide/brain/3dbe2c9c-9b90-42cb-b196-7377deb8603d/.system_generated/logs/transcript.jsonl';

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  let count = 0;
  for (let i = 0; i < Math.min(2300, lines.length); i++) {
    const line = lines[i];
    if (line.includes('42501') || line.toLowerCase().includes('insufficient_privilege')) {
      count++;
      if (count <= 2) {
        console.log(`\n=== MATCH ${count} (Line ${i + 1}) ===`);
        try {
          const parsed = JSON.parse(line);
          console.log('Source:', parsed.source);
          console.log('Type:', parsed.type);
          console.log('Content preview:', parsed.content ? parsed.content.slice(0, 1000) : 'none');
          if (parsed.tool_calls) {
            console.log('Tool calls:', JSON.stringify(parsed.tool_calls, null, 2));
          }
        } catch {
          console.log('Raw:', line.slice(0, 500));
        }
      }
    }
  }
} else {
  console.log('Log file not found.');
}
