const Interpreter = require('./src/interpreter');
const fs = require('fs');

const files = [
  'examples/hello_world.fl',
  'examples/modules_test.fl',
  'examples/advanced_modules.fl'
];

for (const file of files) {
  console.log('\n' + '='.repeat(60));
  console.log('Running: ' + file);
  console.log('='.repeat(60));

  try {
    const code = fs.readFileSync(file, 'utf8');
    const interp = new Interpreter();
    const result = interp.execute(code);

    if (!result.success) {
      console.error('Error:', result.error);
    }
  } catch (e) {
    console.error('Exception:', e.message);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ 모든 예제 실행 완료!');
console.log('='.repeat(60));
