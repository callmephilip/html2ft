import fetch from "node-fetch";
const he = require("he");

export const html2ft = async (
  html: string,
  childrenFirst: boolean = true,
  apiURL: string = "https://h2x.answer.ai/convert"
): Promise<string> => {
  const formData = new URLSearchParams();

  formData.append("attr1st", childrenFirst ? "0" : "1");
  formData.append("html", html);

  return fetch(apiURL, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((r) => {
      // make sure this regex works with multiline strings
      // const code = r.match(/<code>(.*?)<\/code>/m);
      const code = r.match(/<code>([\s\S]*?)<\/code>/m);
      if (code) {
        return he.decode(code[1]);
      } else {
        throw new Error("Failed to convert HTML to FT");
      }

      //   extract code from response below
      //       <pre>
      //         <code>
      //           Figure( Img(src=&#x27;/sarah-dayan.jpg&#x27;, alt=&#x27;&#x27;,
      //           width=&#x27;384&#x27;, height=&#x27;512&#x27;, cls=&#x27;w-24 h-24
      //           rounded-full mx-auto&#x27;), Div( Blockquote( P(&quot;“Tailwind CSS is
      //           the only framework that I&#x27;ve seen scale\r\n\t\t\t\ton large
      //           teams. It’s easy to customize, adapts to any design,\r\n\t\t\t\tand
      //           the build size is tiny.”&quot;, cls=&#x27;text-lg font-medium&#x27;)
      //           ), Figcaption( Div(&#x27;Sarah Dayan&#x27;), Div(&#x27;Staff Engineer,
      //           Algolia&#x27;) ), cls=&#x27;pt-6 space-y-4&#x27; ),
      //           cls=&#x27;bg-slate-100 rounded-xl p-8 dark:bg-slate-800&#x27; )
      //         </code>
      //       </pre>
    });
};
