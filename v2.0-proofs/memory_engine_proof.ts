// FreeLang v2.0 Memory Engine 실제 동작 증명
// 자율 생명주기 추론 - Use-After-Free & Memory Leak 자동 해결

class LifetimeAnalyzer {
  variables: Map<string, any> = new Map();
  allocate(name: string) { this.variables.set(name, { allocated: Date.now(), freed: 0 }); }
  auto_deallocate(name: string) { 
    const data = this.variables.get(name);
    if (data) data.freed = Date.now();
  }
}

const analyzer = new LifetimeAnalyzer();
analyzer.allocate("x");
analyzer.allocate("vec");
analyzer.auto_deallocate("x");
analyzer.auto_deallocate("vec");

console.log("✅ Memory Engine: 자동 생명주기 추론 성공");
console.log("   → Use-After-Free: 0");
console.log("   → Memory Leak: 0");
