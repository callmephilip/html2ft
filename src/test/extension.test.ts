import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { html2ft } from "../converter";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  test("html2ft test", async () => {
    assert.strictEqual(await html2ft("<div>hello</div>"), "Div('hello')");
    assert.strictEqual(
      (
        await html2ft(
          `<figure class="bg-slate-100 rounded-xl p-8 dark:bg-slate-800">
		<img class="w-24 h-24 rounded-full mx-auto" src="/sarah-dayan.jpg" alt="" width="384" height="512">
		<div class="pt-6 space-y-4">
			<blockquote>
			<p class="text-lg font-medium">
				“Tailwind CSS is the only framework that I've seen scale on large teams. It's easy to customize, adapts to any design, and the build size is tiny.”
			</p>
			</blockquote>
			<figcaption>
			<div>
				Sarah Dayan
			</div>
			<div>
				Staff Engineer, Algolia
			</div>
			</figcaption>
		</div>
		</figure>`
        )
      ).replace(/  +/g, ""),
      `Figure(
          Img(src='/sarah-dayan.jpg', alt='', width='384', height='512', cls='w-24 h-24 rounded-full mx-auto'),
          Div(
              Blockquote(
                  P("“Tailwind CSS is the only framework that I've seen scale on large teams. It's easy to customize, adapts to any design, and the build size is tiny.”", cls='text-lg font-medium')
              ),
              Figcaption(
                  Div('Sarah Dayan'),
                  Div('Staff Engineer, Algolia')
              ),
              cls='pt-6 space-y-4'
          ),
          cls='bg-slate-100 rounded-xl p-8 dark:bg-slate-800'
      )`.replace(/  +/g, "")
    );
  });
});
