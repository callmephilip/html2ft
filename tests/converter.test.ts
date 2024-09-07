import { describe, expect, it } from "vitest";
import { html2ft } from "../src/converter";

const testCases = [
  {
    description: "simple div",
    input: "<div>hello</div>",
    expected: 'Div("hello")',
  },
  {
    description: "somewhat complex stuff, children first",
    input: `<figure class="bg-slate-100 rounded-xl p-8 dark:bg-slate-800">
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
    	</figure>`,
    attr1st: false,
    expected: `Figure(
    Img(src='/sarah-dayan.jpg', alt='', width='384', height='512', cls='w-24 h-24 rounded-full mx-auto'),
    Div(
        Blockquote(
            P("“Tailwind CSS is the only framework that I've seen scale on large teams. It's easy to customize, adapts to any design, and the build size is tiny.”", cls='text-lg font-medium')
        ),
        Figcaption(
            Div("Sarah Dayan"),
            Div("Staff Engineer, Algolia")
        ),
        cls='pt-6 space-y-4'
    ),
    cls='bg-slate-100 rounded-xl p-8 dark:bg-slate-800'
)`,
  },
  {
    description: "somewhat complex stuff, attrs first",
    input: `<figure class="bg-slate-100 rounded-xl p-8 dark:bg-slate-800">
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
    	</figure>`,
    attr1st: true,
    expected: `Figure(cls='bg-slate-100 rounded-xl p-8 dark:bg-slate-800')(
    Img(src='/sarah-dayan.jpg', alt='', width='384', height='512', cls='w-24 h-24 rounded-full mx-auto'),
    Div(cls='pt-6 space-y-4')(
        Blockquote(
            P("“Tailwind CSS is the only framework that I've seen scale on large teams. It's easy to customize, adapts to any design, and the build size is tiny.”", cls='text-lg font-medium')
        ),
        Figcaption(
            Div("Sarah Dayan"),
            Div("Staff Engineer, Algolia")
        )
    )
)`,
  },
  {
    description: "simple div with comments",
    input: "<!-- comment --><div><h1>hello world</h1></div>",
    attr1st: false,
    expected: `Div(
    H1("hello world")
)`,
  },
  {
    description: "basic page",
    input: `
        <!DOCTYPE html>
        <html>
        <head>
        <title>Page Title</title>
        </head>
        <body>

        <h1>This is a Heading</h1>
        <p>This is a paragraph.</p>

        </body>
        </html>
      `,
    attr1st: false,
    expected: `Html(
    Head(
        Title("Page Title")
    ),
    Body(
        H1("This is a Heading"),
        P("This is a paragraph.")
    )
)`,
  },
  {
    description: "head and body",
    input: `
        <head>
          <title>Page Title</title>
        </head>
        <body>
          <h1>This is a Heading</h1>
          <p>This is a paragraph.</p>
        </body>
      `,
    attr1st: false,
    expected: `Head(
    Title("Page Title")
)
Body(
    H1("This is a Heading"),
    P("This is a paragraph.")
)`,
  },
];

describe("html2ft", () => {
  testCases.forEach(({ description, input, attr1st, expected }) => {
    it(description, () => {
      expect(html2ft(input, attr1st)).toBe(expected);
    });
  });
});
