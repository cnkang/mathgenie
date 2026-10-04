import { describe, expect, it } from "vite-plus/test";
import { analyzeSource } from "../../../scripts/sonar-check";
describe("effective AST quality checks", () => {
  it("rejects shell spawning and dynamic evaluation", () => {
    const issues = analyzeSource("fixture.ts", "exec('bad'); eval('bad'); spawn('tool', [], {shell:true});");
    expect(issues.map((issue) => issue.rule)).toEqual(["unsafe-execution", "unsafe-execution", "process-options"]);
  });
  it("checks parameters, complexity and identical comparisons", () => {
    const branches = "if (x) x++;".repeat(26);
    const issues = analyzeSource("fixture.ts", `function bad(a,b,c,d,e,f,g,h) { let x=0; ${branches} return x === x; }`);
    expect(issues.map((issue) => issue.rule)).toEqual(["S107", "complexity", "S1764"]);
  });
  it("accepts structured timed execution and simple expressions", () => {
    expect(analyzeSource("fixture.ts", "spawnSync(bin, args, {shell:false,timeout:5000}); const sum=(a,b)=>a+b;")).toEqual([]);
  });
});
