import { Parser } from "htmlparser2";

let scriptContent = "";

const parser = new Parser(
  {
    onopentag(name, attribs) {
      if (name === "script" && attribs.id === "upfile-app-bridge-signal") {
        parser._collect = true;
      }
    },
    ontext(text) {
      if (parser._collect) {
        scriptContent += text;
      }
    },
    onclosetag(tagname) {
      if (tagname === "script") {
        parser._collect = false;
      }
    },
  },
  { decodeEntities: true },
);

parser.write(html);
parser.end();

const data = JSON.parse(scriptContent);






















