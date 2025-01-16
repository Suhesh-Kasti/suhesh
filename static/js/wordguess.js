document.addEventListener("DOMContentLoaded", function () {
  // Get the required HTML elements
  const questionTextElement = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options");
  const feedbackMessageElement = document.getElementById("feedback-message");
  const correctCountElement = document.getElementById("correct-count");
  const wrongCountElement = document.getElementById("wrong-count");
  const tryAgainButton = document.getElementById("try-again-button");

  // Get the code from the query parameter or the window.quizCode variable
  var urlParams = new URLSearchParams(window.location.search);
  var codeFromUrl = urlParams.get("code");
  var quizCode = codeFromUrl || window.quizCode || "burp101"; // Use code from URL, window.quizCode variable, or default to "h01"

  // Game state variables
  let score = 0;
  let currentQuestionIndex = 0;
  let currentCategory = quizCode;

  // Define question sets
  var questionSets = {
    nmap101: [
      {
        correctAnswer: "TCP connect",
        options: ["TCP connect", "SYN", "ACK", "FIN"],
        question:
          "What is the most reliable method for Nmap to determine if a port is open or closed?",
      },
      {
        correctAnswer: "-p-",
        options: ["-p1-1000", "-p-", "-p80,443,22", "-pU:53,T:21-25"],
        question: "What Nmap flag is used to scan all 65535 ports?",
      },
      {
        correctAnswer: "-sV",
        options: ["-sV", "-sS", "-sU", "-sX"],
        question:
          "Which Nmap flag enables version detection to determine the service/version on an open port?",
      },
      {
        correctAnswer: "-sC",
        options: ["-sV", "-sC", "-sS", "-sX"],
        question:
          "Which Nmap flag is used to run default nmap scripts for further enumeration?",
      },
      {
        correctAnswer: "-Pn",
        options: ["-Pn", "-sn", "-sV", "-sC"],
        question:
          "What Nmap flag is used to skip host discovery and scan the specified target(s)?",
      },
      {
        correctAnswer: "Yes",
        options: ["Yes", "No"],
        question:
          "Can Nmap be used to perform vulnerability scanning on remote hosts?",
      },
      {
        correctAnswer: "firewall",
        options: ["firewall", "antivirus", "IDS", "proxy"],
        question:
          "What type of security system might block or interfere with Nmap scans?",
      },
      {
        correctAnswer: "nmap-vulners",
        options: [
          "nmap-vulners",
          "nmap-scripts",
          "nmap-services",
          "nmap-version",
        ],
        question:
          "What is the name of the Nmap script that checks for vulnerabilities on open services?",
      },
      {
        correctAnswer: "-sn -PE -PP -PM",
        options: ["-sn -PE -PP -PM", "-Pn", "-sV", "-sC"],
        question:
          "What combination of Nmap flags can be used for ping scan to find active hosts?",
      },
      {
        correctAnswer: "-oN",
        options: ["-oX", "-oG", "-oN", "-oA"],
        question:
          "Which Nmap flag is used to save the output in normal format (human-readable)?",
      },
      {
        correctAnswer: "-sU",
        options: ["-sS", "-sT", "-sU", "-sY"],
        question: "Which Nmap flag is used to perform a UDP scan?",
      },
      {
        correctAnswer: "-sN",
        options: ["-sF", "-sN", "-sX", "-sI"],
        question: "Which Nmap flag is used for TCP Null scan?",
      },
      {
        correctAnswer: "-sF",
        options: ["-sF", "-sN", "-sX", "-sI"],
        question: "Which Nmap flag is used for TCP FIN scan?",
      },
      {
        correctAnswer: "-sA",
        options: ["-sW", "-sA", "-sM", "-sZ"],
        question: "Which Nmap flag is used for TCP ACK scan?",
      },
      {
        correctAnswer: "-sW",
        options: ["-sW", "-sA", "-sM", "-sZ"],
        question: "Which Nmap flag is used for TCP Window scan?",
      },
      {
        correctAnswer: "-sM",
        options: ["-sW", "-sA", "-sM", "-sZ"],
        question: "Which Nmap flag is used for TCP Maimon scan?",
      },
      {
        correctAnswer: "-f",
        options: ["-f", "--mtu", "--data-length", "--scan-delay"],
        question: "Which Nmap flag is used to fragment packets?",
      },
      {
        correctAnswer: "--data-length",
        options: ["-f", "--mtu", "--data-length", "--scan-delay"],
        question:
          "Which Nmap flag is used to specify the length of the TCP data payload?",
      },
      {
        correctAnswer: "--scan-delay",
        options: ["-f", "--mtu", "--data-length", "--scan-delay"],
        question:
          "Which Nmap flag is used to specify the delay between each probe sent?",
      },
      {
        correctAnswer: "-sI",
        options: ["-sF", "-sN", "-sX", "-sI"],
        question: "Which Nmap flag is used for idle/zombie scan?",
      },
      {
        correctAnswer: "-D",
        options: ["-D", "-S", "--proxies", "--source-port"],
        question: "Which Nmap flag is used to specify a decoy IP address?",
      },
      {
        correctAnswer: "-S",
        options: ["-D", "-S", "--proxies", "--source-port"],
        question: "Which Nmap flag is used to specify a source IP address?",
      },
      {
        correctAnswer: "--proxies",
        options: ["-D", "-S", "--proxies", "--source-port"],
        question:
          "Which Nmap flag is used to specify a proxy server to use for scanning?",
      },
      {
        correctAnswer: "--source-port",
        options: ["-D", "-S", "--proxies", "--source-port"],
        question: "Which Nmap flag is used to specify a source port number?",
      },
      {
        correctAnswer: "-sV --version-intensity",
        options: [
          "-sV --version-intensity",
          "-sV --version-light",
          "-sV --version-all",
          "-sV --version-trace",
        ],
        question:
          "Which Nmap flags are used to enable intense version detection?",
      },
      {
        correctAnswer: "-sV --version-light",
        options: [
          "-sV --version-intensity",
          "-sV --version-light",
          "-sV --version-all",
          "-sV --version-trace",
        ],
        question:
          "Which Nmap flags are used to enable light version detection?",
      },
      {
        correctAnswer: "-sV --version-all",
        options: [
          "-sV --version-intensity",
          "-sV --version-light",
          "-sV --version-all",
          "-sV --version-trace",
        ],
        question:
          "Which Nmap flags are used to enable all version detection techniques?",
      },
      {
        correctAnswer: "-sV --version-trace",
        options: [
          "-sV --version-intensity",
          "-sV --version-light",
          "-sV --version-all",
          "-sV --version-trace",
        ],
        question:
          "Which Nmap flags are used to enable version detection and show details of the detection process?",
      },
      {
        correctAnswer: "-sV --script=banner",
        options: [
          "-sV --script=banner",
          "-sV --script=http-title",
          "-sV --script=dns-brute",
          "-sV --script=smb-enum-shares",
        ],
        question:
          "Which Nmap flags are used to run the banner script to grab service banners?",
      },
      {
        correctAnswer: "-sV --script=http-title",
        options: [
          "-sV --script=banner",
          "-sV --script=http-title",
          "-sV --script=dns-brute",
          "-sV --script=smb-enum-shares",
        ],
        question:
          "Which Nmap flags are used to run the http-title script to grab webpage titles?",
      },
      {
        correctAnswer: "-sV --script=dns-brute",
        options: [
          "-sV --script=banner",
          "-sV --script=http-title",
          "-sV --script=dns-brute",
          "-sV --script=smb-enum-shares",
        ],
        question:
          "Which Nmap flags are used to run the dns-brute script to brute force DNS hostnames?",
      },
      {
        correctAnswer: "-sV --script=smb-enum-shares",
        options: [
          "-sV --script=banner",
          "-sV --script=http-title",
          "-sV --script=dns-brute",
          "-sV --script=smb-enum-shares",
        ],
        question:
          "Which Nmap flags are used to run the smb-enum-shares script to enumerate SMB shares?",
      },
      {
        correctAnswer: "-sV --script=vuln",
        options: [
          "-sV --script=vuln",
          "-sV --script=exploit",
          "-sV --script=auth",
          "-sV --script=brute",
        ],
        question:
          "Which Nmap flags are used to run scripts that check for vulnerabilities?",
      },
      {
        correctAnswer: "-sV --script=exploit",
        options: [
          "-sV --script=vuln",
          "-sV --script=exploit",
          "-sV --script=auth",
          "-sV --script=brute",
        ],
        question:
          "Which Nmap flags are used to run scripts that attempt to exploit vulnerabilities?",
      },
      {
        correctAnswer: "-sV --script=auth",
        options: [
          "-sV --script=vuln",
          "-sV --script=exploit",
          "-sV --script=auth",
          "-sV --script=brute",
        ],
        question:
          "Which Nmap flags are used to run scripts that attempt to bypass authentication mechanisms?",
      },
      {
        correctAnswer: "-sV --script=brute",
        options: [
          "-sV --script=vuln",
          "-sV --script=exploit",
          "-sV --script=auth",
          "-sV --script=brute",
        ],
        question:
          "Which Nmap flags are used to run scripts that perform brute-force attacks?",
      },
      {
        correctAnswer: "--script-args",
        options: [
          "--script-args",
          "--script-help",
          "--script-trace",
          "--script-updatedb",
        ],
        question:
          "Which Nmap flag is used to provide arguments to NSE scripts?",
      },
      {
        correctAnswer: "--script-help",
        options: [
          "--script-args",
          "--script-help",
          "--script-trace",
          "--script-updatedb",
        ],
        question:
          "Which Nmap flag is used to get help information for NSE scripts?",
      },
      {
        correctAnswer: "--script-trace",
        options: [
          "--script-args",
          "--script-help",
          "--script-trace",
          "--script-updatedb",
        ],
        question:
          "Which Nmap flag is used to enable trace output for NSE scripts?",
      },
      {
        correctAnswer: "--script-updatedb",
        options: [
          "--script-args",
          "--script-help",
          "--script-trace",
          "--script-updatedb",
        ],
        question: "Which Nmap flag is used to update the script database?",
      },
      {
        correctAnswer: "-p-",
        options: ["-p22", "-p22,80,443", "-p-", "-p1-1024"],
        question: "Which Nmap flag is used to scan all ports from 1 to 65535?",
      },
      {
        correctAnswer: "-p1-1024",
        options: ["-p22", "-p22,80,443", "-p-", "-p1-1024"],
        question: "Which Nmap flag is used to scan ports from 1 to 1024?",
      },
      {
        correctAnswer: "-p22,80,443",
        options: ["-p22", "-p22,80,443", "-p-", "-p1-1024"],
        question:
          "Which Nmap flag is used to scan specific ports like 22, 80, and 443?",
      },
      {
        correctAnswer: "-p22",
        options: ["-p22", "-p22,80,443", "-p-", "-p1-1024"],
        question: "Which Nmap flag is used to scan only port 22?",
      },
      {
        correctAnswer: "--top-ports",
        options: [
          "--top-ports",
          "--port-ratio",
          "--max-rtt-timeout",
          "--min-rtt-timeout",
        ],
        question:
          "Which Nmap flag is used to scan only the top X most common ports?",
      },
      {
        correctAnswer: "--port-ratio",
        options: [
          "--top-ports",
          "--port-ratio",
          "--max-rtt-timeout",
          "--min-rtt-timeout",
        ],
        question: "Which Nmap flag is used to specify the port scan ratio?",
      },
      {
        correctAnswer: "--max-rtt-timeout",
        options: [
          "--top-ports",
          "--port-ratio",
          "--max-rtt-timeout",
          "--min-rtt-timeout",
        ],
        question:
          "Which Nmap flag is used to specify the maximum round-trip time for TCP connections?",
      },
      {
        correctAnswer: "--min-rtt-timeout",
        options: [
          "--top-ports",
          "--port-ratio",
          "--max-rtt-timeout",
          "--min-rtt-timeout",
        ],
        question:
          "Which Nmap flag is used to specify the minimum round-trip time for TCP connections?",
      },
      {
        correctAnswer: "-sn",
        options: ["-sn", "-sP", "-Pn", "-n"],
        question:
          "Which Nmap flag is used to perform a ping scan to determine which hosts are online?",
      },
      {
        correctAnswer: "-sP",
        options: ["-sn", "-sP", "-Pn", "-n"],
        question:
          "Which Nmap flag is used to perform a ping scan like -sn, but will also send TCP and UDP packets to open ports?",
      },
      {
        correctAnswer: "-Pn",
        options: ["-sn", "-sP", "-Pn", "-n"],
        question:
          "Which Nmap flag is used to skip host discovery and treat all specified hosts as online?",
      },
      {
        correctAnswer: "-n",
        options: ["-sn", "-sP", "-Pn", "-n"],
        question:
          "Which Nmap flag is used to disable DNS resolution and only show IP addresses in the output?",
      },
    ],

    burp101: [
      {
        correctAnswer: "Proxy",
        options: ["Proxy", "Spider", "Scanner", "Repeater"],
        question:
          "Which BurpSuite tool acts as an intermediary between the web browser and the target web application, allowing interception and modification of HTTP/HTTPS traffic?",
      },
      {
        correctAnswer: "Spider",
        options: ["Proxy", "Spider", "Scanner", "Repeater"],
        question:
          "Which BurpSuite tool is used to crawl and map the content and functionality of a website?",
      },
      {
        correctAnswer: "Scanner",
        options: ["Proxy", "Spider", "Scanner", "Repeater"],
        question:
          "Which BurpSuite tool is used to scan web applications for various vulnerabilities like SQL injection and XSS?",
      },
      {
        correctAnswer: "Repeater",
        options: ["Proxy", "Spider", "Scanner", "Repeater"],
        question:
          "Which BurpSuite tool is used to manually modify and resend HTTP requests?",
      },
      {
        correctAnswer: "Decoder",
        options: ["Decoder", "Comparer", "Intruder", "Sequencer"],
        question:
          "Which BurpSuite tool is used to encode and decode data in various formats?",
      },
      {
        correctAnswer: "Comparer",
        options: ["Decoder", "Comparer", "Intruder", "Sequencer"],
        question:
          "Which BurpSuite tool is used to visually compare different application responses?",
      },
      {
        correctAnswer: "Intruder",
        options: ["Decoder", "Comparer", "Intruder", "Sequencer"],
        question:
          "Which BurpSuite tool is used to automate customized attacks and test for vulnerabilities?",
      },
      {
        correctAnswer: "Sequencer",
        options: ["Decoder", "Comparer", "Intruder", "Sequencer"],
        question:
          "Which BurpSuite tool is used to analyze the randomness of session tokens?",
      },
      {
        correctAnswer: "Yes",
        options: ["Yes", "No"],
        question:
          "Can BurpSuite be used for both manual and automated web application security testing?",
      },
      {
        correctAnswer: "Interception",
        options: ["Interception", "Scanning", "Exploitation", "Reporting"],
        question: "What is the primary purpose of the Proxy tool in BurpSuite?",
      },
      {
        correctAnswer: "Scanning",
        options: ["Interception", "Scanning", "Exploitation", "Reporting"],
        question:
          "What is the primary purpose of the Scanner tool in BurpSuite?",
      },
      {
        correctAnswer: "Exploitation",
        options: ["Interception", "Scanning", "Exploitation", "Reporting"],
        question:
          "What is the primary purpose of the Intruder tool in BurpSuite?",
      },
      {
        correctAnswer: "Reporting",
        options: ["Interception", "Scanning", "Exploitation", "Reporting"],
        question:
          "What is one of the key features of BurpSuite that aids in collaboration and documentation?",
      },
      {
        correctAnswer: "Passive",
        options: ["Active", "Passive", "Both", "Neither"],
        question:
          "Which type of vulnerability scanning is performed by the Spider tool in BurpSuite?",
      },
      {
        correctAnswer: "Active",
        options: ["Active", "Passive", "Both", "Neither"],
        question:
          "Which type of vulnerability scanning is performed by the Scanner tool in BurpSuite?",
      },
      {
        correctAnswer: "Yes",
        options: ["Yes", "No"],
        question:
          "Can BurpSuite be used to test web applications running on different platforms and frameworks?",
      },
      {
        correctAnswer: "False",
        options: ["True", "False"],
        question:
          "Is it ethical to use BurpSuite to test web applications without proper authorization?",
      },
      {
        correctAnswer: "Replay",
        options: ["Replay", "Fuzz", "Sniper", "Battering Ram"],
        question:
          "Which attack type in the Intruder tool is used to resend the same request multiple times?",
      },
      {
        correctAnswer: "Sniper",
        options: ["Replay", "Fuzz", "Sniper", "Battering Ram"],
        question:
          "Which attack type in the Intruder tool is used to target specific parameters with payloads?",
      },
      {
        correctAnswer: "Battering Ram",
        options: ["Replay", "Fuzz", "Sniper", "Battering Ram"],
        question:
          "Which attack type in the Intruder tool is used to inject payloads in every possible position?",
      },
      {
        correctAnswer: "Fuzz",
        options: ["Replay", "Fuzz", "Sniper", "Battering Ram"],
        question:
          "Which attack type in the Intruder tool is used to send semi-random payloads to identify potential vulnerabilities?",
      },
      {
        correctAnswer: "Cookies",
        options: ["Cookies", "Headers", "Parameters", "Request Body"],
        question:
          "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?",
      },
      {
        correctAnswer: "Headers",
        options: ["Cookies", "Headers", "Parameters", "Request Body"],
        question:
          "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?",
      },
      {
        correctAnswer: "Parameters",
        options: ["Cookies", "Headers", "Parameters", "Request Body"],
        question:
          "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?",
      },
      {
        correctAnswer: "Request Body",
        options: ["Cookies", "Headers", "Parameters", "Request Body"],
        question:
          "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?",
      },
      {
        correctAnswer: "Yes",
        options: ["Yes", "No"],
        question:
          "Can BurpSuite be used to test web applications for vulnerabilities like SQL injection, XSS, and CSRF?",
      },
      {
        correctAnswer: "Collaborator Client",
        options: [
          "Collaborator Client",
          "Collaborator Server",
          "Burp Collaborator",
          "Burp Hunter",
        ],
        question:
          "Which BurpSuite tool is used to generate a unique payload that can be used for external interaction and vulnerability detection?",
      },
      {
        correctAnswer: "Collaborator Server",
        options: [
          "Collaborator Client",
          "Collaborator Server",
          "Burp Collaborator",
          "Burp Hunter",
        ],
        question:
          "Which BurpSuite component listens for interactions with the Collaborator Client payloads?",
      },
      {
        correctAnswer: "Yes",
        options: ["Yes", "No"],
        question:
          "Can BurpSuite be used to test the security of web services and APIs, in addition to traditional web applications?",
      },
      {
        correctAnswer: "Macros",
        options: ["Macros", "Scripts", "Extensions", "Plugins"],
        question:
          "Which feature in BurpSuite allows users to record and playback a series of actions?",
      },
      {
        correctAnswer: "Extensions",
        options: ["Macros", "Scripts", "Extensions", "Plugins"],
        question:
          "Which feature in BurpSuite allows users to add third-party extensions to enhance functionality?",
      },
      {
        correctAnswer: "XML",
        options: ["XML", "JSON", "HTML", "Markdown"],
        question:
          "Which data format is commonly used by BurpSuite for storing and sharing project data?",
      },
      {
        correctAnswer: "Yes",
        options: ["Yes", "No"],
        question:
          "Can BurpSuite be integrated with other security tools and frameworks?",
      },
      {
        correctAnswer: "Target",
        options: ["Target", "Scope", "Site Map", "Issue Definitions"],
        question:
          "Which BurpSuite feature is used to specify the target web application or website?",
      },
      {
        correctAnswer: "Site Map",
        options: ["Target", "Scope", "Site Map", "Issue Definitions"],
        question:
          "Which BurpSuite feature provides a hierarchical view of the mapped content and functionality of the target web application?",
      },
      {
        correctAnswer: "Scope",
        options: ["Target", "Scope", "Site Map", "Issue Definitions"],
        question:
          "Which BurpSuite feature is used to define the areas of the application that should be included or excluded from testing?",
      },
      {
        correctAnswer: "Issue Definitions",
        options: ["Target", "Scope", "Site Map", "Issue Definitions"],
        question:
          "Which BurpSuite feature is used to manage and configure the types of vulnerabilities that the Scanner should look for?",
      },
      {
        correctAnswer: "CSRF",
        options: ["XSS", "SQLi", "CSRF", "LFI"],
        question:
          "Which type of vulnerability can be detected and exploited using BurpSuite's Repeater tool?",
      },
      {
        correctAnswer: "SQLi",
        options: ["XSS", "SQLi", "CSRF", "LFI"],
        question:
          "Which type of vulnerability can be detected and exploited using BurpSuite's Intruder tool?",
      },
      {
        correctAnswer: "XSS",
        options: ["XSS", "SQLi", "CSRF", "LFI"],
        question:
          "Which type of vulnerability can be detected by BurpSuite's Scanner tool?",
      },
      {
        correctAnswer: "LFI",
        options: ["XSS", "SQLi", "CSRF", "LFI"],
        question:
          "Which type of vulnerability can be detected and exploited using BurpSuite's Repeater and Intruder tools?",
      },
      {
        correctAnswer: "HTTP Request Smuggling",
        options: [
          "HTTP Request Smuggling",
          "XML External Entity",
          "Server-Side Request Forgery",
          "Insecure Deserialization",
        ],
        question:
          "Which type of vulnerability can be tested using BurpSuite's Repeater and Intruder tools, and may involve obfuscating or manipulating HTTP headers?",
      },
      {
        correctAnswer: "XML External Entity",
        options: [
          "HTTP Request Smuggling",
          "XML External Entity",
          "Server-Side Request Forgery",
          "Insecure Deserialization",
        ],
        question:
          "Which type of vulnerability can be tested using BurpSuite's Repeater tool, and may involve exploiting XML parsers to read system files or perform other actions?",
      },
      {
        correctAnswer: "Server-Side Request Forgery",
        options: [
          "HTTP Request Smuggling",
          "XML External Entity",
          "Server-Side Request Forgery",
          "Insecure Deserialization",
        ],
        question:
          "Which type of vulnerability can be tested using BurpSuite's Repeater and Collaborator tools, and involves causing the server to make unintended requests?",
      },
      {
        correctAnswer: "Insecure Deserialization",
        options: [
          "HTTP Request Smuggling",
          "XML External Entity",
          "Server-Side Request Forgery",
          "Insecure Deserialization",
        ],
        question:
          "Which type of vulnerability can be tested using BurpSuite's Repeater and Intruder tools, and involves manipulating serialized data to execute arbitrary code or actions?",
      },
      {
        correctAnswer: "False",
        options: ["True", "False"],
        question:
          "Is it a good practice to use BurpSuite to test web applications without understanding the potential impact and consequences?",
      },
      {
        correctAnswer: "Engagement Rules",
        options: [
          "Engagement Rules",
          "Scope Creep",
          "False Positives",
          "Performance Impact",
        ],
        question:
          "Which term refers to the defined boundaries and limitations of a web application security testing engagement?",
      },
      {
        correctAnswer: "Scope Creep",
        options: [
          "Engagement Rules",
          "Scope Creep",
          "False Positives",
          "Performance Impact",
        ],
        question:
          "Which term refers to the unintended expansion of testing beyond the initially agreed-upon scope?",
      },
      {
        correctAnswer: "False Positives",
        options: [
          "Engagement Rules",
          "Scope Creep",
          "False Positives",
          "Performance Impact",
        ],
        question:
          "Which term refers to vulnerabilities reported by a scanner that do not actually exist or pose a risk?",
      },
      {
        correctAnswer: "Performance Impact",
        options: [
          "Engagement Rules",
          "Scope Creep",
          "False Positives",
          "Performance Impact",
        ],
        question:
          "Which term refers to the potential effect of security testing on the target web application's performance or availability?",
      },
      {
        correctAnswer: "BurpSuite Professional",
        options: [
          "BurpSuite Community Edition",
          "BurpSuite Professional",
          "BurpSuite Enterprise Edition",
        ],
        question:
          "Which edition of BurpSuite includes advanced features like the Crawler, Scanner, and Intruder tools?",
      },
      {
        correctAnswer: "BurpSuite Community Edition",
        options: [
          "BurpSuite Community Edition",
          "BurpSuite Professional",
          "BurpSuite Enterprise Edition",
        ],
        question:
          "Which edition of BurpSuite is free to use but has limited functionality?",
      },
      {
        correctAnswer: "BurpSuite Enterprise Edition",
        options: [
          "BurpSuite Community Edition",
          "BurpSuite Professional",
          "BurpSuite Enterprise Edition",
        ],
        question:
          "Which edition of BurpSuite is designed for large organizations and includes support for team collaboration and centralized reporting?",
      },
    ],

    docker101: [
      {
        correctAnswer: "run",
        options: ["run", "create", "start", "exec"],
        question:
          "Which Docker command is used to create and start a container in one command?",
      },
      {
        correctAnswer: "ps",
        options: ["ps", "ls", "status", "containers"],
        question:
          "Which Docker command is used to list the running containers?",
      },
      {
        correctAnswer: "pull",
        options: ["pull", "clone", "download", "fetch"],
        question:
          "What Docker command is used to download a Docker image from a registry?",
      },
      {
        correctAnswer: "images",
        options: ["images", "list", "show", "containers"],
        question:
          "Which Docker command is used to list the locally available Docker images?",
      },
      {
        correctAnswer: "stop",
        options: ["stop", "pause", "kill", "terminate"],
        question: "Which Docker command is used to stop a running container?",
      },
      {
        correctAnswer: "rmi",
        options: ["rmi", "remove", "delete", "erase"],
        question:
          "What Docker command is used to remove/delete a Docker image?",
      },
      {
        correctAnswer: "logs",
        options: ["logs", "stream", "show", "view"],
        question:
          "Which Docker command is used to view the logs of a container?",
      },
      {
        correctAnswer: "exec",
        options: ["exec", "run", "start", "shell"],
        question:
          "What Docker command is used to run a command in a running container?",
      },
      {
        correctAnswer: "inspect",
        options: ["inspect", "describe", "analyze", "details"],
        question:
          "Which Docker command is used to get detailed information about a Docker object, such as a container or image?",
      },
      {
        correctAnswer: "network",
        options: ["network", "net", "connect", "link"],
        question: "What Docker command is used to manage Docker networks?",
      },
      {
        correctAnswer: "volume",
        options: ["volume", "volumes", "data", "store"],
        question:
          "Which Docker command is used to manage Docker volumes for persistent data?",
      },
      {
        correctAnswer: "build",
        options: ["build", "create", "construct", "make"],
        question:
          "What Docker command is used to build a Docker image from a Dockerfile?",
      },
      {
        correctAnswer: "tag",
        options: ["tag", "label", "mark", "identify"],
        question:
          "Which Docker command is used to tag a Docker image with a name and optional version?",
      },
      {
        correctAnswer: "push",
        options: ["push", "upload", "publish", "share"],
        question:
          "What Docker command is used to push a Docker image to a registry?",
      },
      {
        correctAnswer: "login",
        options: ["login", "signin", "authenticate", "connect"],
        question:
          "Which Docker command is used to log in to a Docker registry?",
      },
      {
        correctAnswer: "logout",
        options: ["logout", "signout", "disconnect", "exit"],
        question:
          "What Docker command is used to log out from a Docker registry?",
      },
      {
        correctAnswer: "info",
        options: ["info", "status", "details", "summary"],
        question:
          "Which Docker command is used to display system-wide information about Docker and its components?",
      },
      {
        correctAnswer: "version",
        options: ["version", "v", "about", "show"],
        question:
          "What Docker command is used to display the Docker version information?",
      },
      {
        correctAnswer: "events",
        options: ["events", "log", "activity", "history"],
        question:
          "Which Docker command is used to get real-time events from the server?",
      },
      {
        correctAnswer: "inspect",
        options: ["inspect", "describe", "analyze", "details"],
        question:
          "Which Docker command is used to get detailed information about a Docker object, such as a container or image?",
      },
      {
        correctAnswer: "system prune",
        options: ["system prune", "cleanup", "clear", "remove unused"],
        question:
          "Which Docker command is used to remove all stopped containers, unused networks, and dangling images in a single command?",
      },
      {
        correctAnswer: "search",
        options: ["search", "find", "lookup", "query"],
        question:
          "What Docker command is used to search for Docker images on Docker Hub?",
      },
      {
        correctAnswer: "cp",
        options: ["cp", "copy", "move", "transfer"],
        question:
          "Which Docker command is used to copy files/folders between a container and the local filesystem?",
      },
      {
        correctAnswer: "stats",
        options: ["stats", "monitor", "live", "usage"],
        question:
          "What Docker command is used to display a live stream of container resource usage statistics?",
      },
      {
        correctAnswer: "rename",
        options: ["rename", "change", "modify", "alter"],
        question: "Which Docker command is used to rename a Docker container?",
      },
      {
        correctAnswer: "pause",
        options: ["pause", "freeze", "halt", "suspend"],
        question:
          "What Docker command is used to pause the execution of processes in a running container?",
      },
      {
        correctAnswer: "unpause",
        options: ["unpause", "resume", "continue", "start"],
        question:
          "Which Docker command is used to resume the execution of processes in a paused container?",
      },
      {
        correctAnswer: "top",
        options: ["top", "ps", "processes", "list"],
        question:
          "What Docker command is used to display the running processes of a container?",
      },
      {
        correctAnswer: "attach",
        options: ["attach", "connect", "join", "link"],
        question:
          "Which Docker command is used to attach to the STDIN, STDOUT, and STDERR of a running container?",
      },
      {
        correctAnswer: "diff",
        options: ["diff", "changes", "delta", "delta"],
        question:
          "What Docker command is used to show the changes made to the filesystem of a container?",
      },
      {
        correctAnswer: "export",
        options: ["export", "save", "backup", "download"],
        question:
          "Which Docker command is used to export a container's filesystem as a tarball?",
      },
      {
        correctAnswer: "import",
        options: ["import", "load", "restore", "upload"],
        question:
          "What Docker command is used to import the contents of a tarball to create a new filesystem image?",
      },
      {
        correctAnswer: "events",
        options: ["events", "log", "activity", "history"],
        question:
          "Which Docker command is used to get real-time events from the server?",
      },
      {
        correctAnswer: "kill",
        options: ["kill", "terminate", "stop", "end"],
        question:
          "What Docker command is used to send a signal to a running container?",
      },
      {
        correctAnswer: "wait",
        options: ["wait", "hold", "pause", "await"],
        question:
          "Which Docker command is used to block until a container stops, then prints the container's exit code?",
      },
      {
        correctAnswer: "update",
        options: ["update", "modify", "change", "alter"],
        question:
          "What Docker command is used to update the configuration of one or more containers?",
      },
      {
        correctAnswer: "rollback",
        options: ["rollback", "revert", "undo", "back"],
        question:
          "Which Docker command is used to roll back to a previous version of a service?",
      },
      {
        correctAnswer: "version",
        options: ["version", "v", "about", "show"],
        question:
          "What Docker command is used to display the Docker version information?",
      },
      {
        correctAnswer: "volume ls",
        options: ["volume ls", "volumes", "list volumes", "ls volumes"],
        question:
          "Which Docker command is used to list all Docker volumes on the host?",
      },
      {
        correctAnswer: "volume inspect",
        options: [
          "volume inspect",
          "inspect volume",
          "volume details",
          "volume info",
        ],
        question:
          "What Docker command is used to display detailed information about a Docker volume?",
      },
      {
        correctAnswer: "volume create",
        options: [
          "volume create",
          "create volume",
          "new volume",
          "make volume",
        ],
        question: "Which Docker command is used to create a new Docker volume?",
      },
      {
        correctAnswer: "volume rm",
        options: ["volume rm", "remove volume", "delete volume", "rm volume"],
        question: "What Docker command is used to remove a Docker volume?",
      },
      {
        correctAnswer: "volume prune",
        options: [
          "volume prune",
          "cleanup volumes",
          "clear volumes",
          "remove unused volumes",
        ],
        question:
          "Which Docker command is used to remove all unused local volumes?",
      },
      {
        correctAnswer: "network ls",
        options: ["network ls", "list networks", "ls networks", "networks"],
        question:
          "What Docker command is used to list all Docker networks on the host?",
      },
      {
        correctAnswer: "network inspect",
        options: [
          "network inspect",
          "inspect network",
          "network details",
          "network info",
        ],
        question:
          "Which Docker command is used to display detailed information about a Docker network?",
      },
      {
        correctAnswer: "network create",
        options: [
          "network create",
          "create network",
          "new network",
          "make network",
        ],
        question: "What Docker command is used to create a new Docker network?",
      },
      {
        correctAnswer: "network rm",
        options: [
          "network rm",
          "remove network",
          "delete network",
          "rm network",
        ],
        question: "Which Docker command is used to remove a Docker network?",
      },
      {
        correctAnswer: "network prune",
        options: [
          "network prune",
          "cleanup networks",
          "clear networks",
          "remove unused networks",
        ],
        question:
          "What Docker command is used to remove all unused local networks?",
      },
      {
        correctAnswer: "config ls",
        options: ["config ls", "list configs", "ls configs", "configs"],
        question:
          "Which Docker command is used to list all Docker configs on the host?",
      },
      {
        correctAnswer: "config inspect",
        options: [
          "config inspect",
          "inspect config",
          "config details",
          "config info",
        ],
        question:
          "What Docker command is used to display detailed information about a Docker config?",
      },
      {
        correctAnswer: "config create",
        options: [
          "config create",
          "create config",
          "new config",
          "make config",
        ],
        question: "Which Docker command is used to create a new Docker config?",
      },
      {
        correctAnswer: "config rm",
        options: ["config rm", "remove config", "delete config", "rm config"],
        question: "What Docker command is used to remove a Docker config?",
      },
      {
        correctAnswer: "config prune",
        options: [
          "config prune",
          "cleanup configs",
          "clear configs",
          "remove unused configs",
        ],
        question:
          "Which Docker command is used to remove all unused local configs?",
      },
      {
        correctAnswer: "secret ls",
        options: ["secret ls", "list secrets", "ls secrets", "secrets"],
        question:
          "What Docker command is used to list all Docker secrets on the host?",
      },
      {
        correctAnswer: "secret inspect",
        options: [
          "secret inspect",
          "inspect secret",
          "secret details",
          "secret info",
        ],
        question:
          "Which Docker command is used to display detailed information about a Docker secret?",
      },
      {
        correctAnswer: "secret create",
        options: [
          "secret create",
          "create secret",
          "new secret",
          "make secret",
        ],
        question: "Which Docker command is used to create a new Docker secret?",
      },
      {
        correctAnswer: "secret rm",
        options: ["secret rm", "remove secret", "delete secret", "rm secret"],
        question: "What Docker command is used to remove a Docker secret?",
      },
      {
        correctAnswer: "secret prune",
        options: [
          "secret prune",
          "cleanup secrets",
          "clear secrets",
          "remove unused secrets",
        ],
        question:
          "Which Docker command is used to remove all unused local secrets?",
      },
      {
        correctAnswer: "service ls",
        options: ["service ls", "list services", "ls services", "services"],
        question:
          "What Docker command is used to list all Docker services on the host?",
      },
      {
        correctAnswer: "service inspect",
        options: [
          "service inspect",
          "inspect service",
          "service details",
          "service info",
        ],
        question:
          "Which Docker command is used to display detailed information about a Docker service?",
      },
      {
        correctAnswer: "service create",
        options: [
          "service create",
          "create service",
          "new service",
          "make service",
        ],
        question:
          "Which Docker command is used to create a new Docker service?",
      },
      {
        correctAnswer: "service update",
        options: [
          "service update",
          "update service",
          "modify service",
          "alter service",
        ],
        question:
          "What Docker command is used to update the configuration of a service?",
      },
      {
        correctAnswer: "service rm",
        options: [
          "service rm",
          "remove service",
          "delete service",
          "rm service",
        ],
        question: "Which Docker command is used to remove a Docker service?",
      },
      {
        correctAnswer: "service scale",
        options: [
          "service scale",
          "scale service",
          "adjust service",
          "resize service",
        ],
        question:
          "What Docker command is used to scale the number of replicas in a service?",
      },
      {
        correctAnswer: "system df",
        options: ["system df", "df", "disk usage", "disk free"],
        question:
          "Which Docker command is used to display the total disk space used by Docker and the amount of free space?",
      },
      {
        correctAnswer: "system events",
        options: [
          "system events",
          "events",
          "system activity",
          "server events",
        ],
        question:
          "What Docker command is used to get real-time events from the server?",
      },
    ],

    f5101: [
      {
        correctAnswer: "provides user filtered access",
        options: [
          "provides redundancy",
          "measures usage against an identity",
          "provides user filtered access",
          "ensures the correct identity",
        ],
        question:
          "What describes the third \u2018\u2019A\u2019\u2019 in the common authentication acronym AAA?",
      },
      {
        correctAnswer: "Not found",
        options: [
          "Not Acceptable",
          "Forbidden",
          "Request Timeout",
          "Not found",
        ],
        question: "What does the HTTP status code 404 mean?",
      },
      {
        correctAnswer: "tmsh qkview",
        options: [
          "imsh generate snapshot",
          "tmsh tcpdump",
          "tmsh save sys ucs support",
          "tmsh qkview",
        ],
        question:
          "A BIG-IP Administrator contacts F5 Support and is asked to upload a Support Snapshot. Which command should be entered to the CLI to generate the requested\nfile?",
      },
      {
        correctAnswer: "00.33. 33. 33. 33",
        options: [
          "00. 11. 11. 11. 11",
          "f1. f1. f1. f1. f1",
          "00.33. 33. 33. 33",
          "00. 22. 22. 22. 22",
        ],
        question:
          "Client A from the 192. 162. 168.0. 0 0/24 network wants to send a Ping to Client B on 10.10.10..0/24.\nThe Default Gateway from Client A IS 192.168.0. 1\nThe MAC Address of Client A is00 11. 11. 11. 11\nThe MAC Address of client B is 00.22 22.22.22\nThe MAC Address of Default Gateway is 00. 33.33. 33. 33\nWhat is the destination MAC Address of the ping packet when it leaves client A interface card?",
      },
      {
        correctAnswer: "MAC masquerading",
        options: [
          "MAC masquerading",
          "Clone pool",
          "External monitors",
          "One Connect profile",
        ],
        question:
          "What should a BIG-IP Administrator configure to minimize impact during a failure?",
      },
      {
        correctAnswer:
          "Download the product version image from downloads f5.com",
        options: [
          "Download the product version image from ihealth f5 com",
          "Download the product version image from support 6 com",
          "Download the product version image from dovcentral f5.com",
          "Download the product version image from downloads f5.com",
        ],
        question:
          "What is the correct procedure to comply with the recommendation?",
      },
      {
        correctAnswer:
          "II failing over network connection based on heartbeat detection",
        options: [
          "failing over based on an over temperature alarm",
          "failing over serial cable based on electric failure code",
          "II failing over network connection based on heartbeat detection",
          "fading over network connection based on SNMP error",
        ],
        question:
          "What are Iwo examples of failover capabilities of BIG-IP? (Choose two )",
      },
      {
        correctAnswer: "Passive FTP",
        options: ["Passive FTP", "Secure FTP", "Active FTP", "Protected FTP"],
        question:
          "Which FTP mode should be used by a client behind a firewall that has no special configurator?",
      },
      {
        correctAnswer: "Interface 1.2 shows 9.2K errors",
        options: [
          "The virtual server indicates 14 slow connections killed",
          "The pool member is unchecked",
          "Interface 1.2 shows 9.2K errors",
          "The pool shows no current connections.",
        ],
        question:
          "What should the administrator investigate first to address this traffic slownes",
      },
      {
        correctAnswer: "full proxy architecture",
        options: [
          "packet-based architecture",
          "full proxy architecture",
          "hub and spoke architecture",
          "ring network architecture",
        ],
        question:
          "An administrator lakes a capture of five Traffic using tcpdump. The administrator notices that different ephemeral port numbers are architecture does this indicate?",
      },
      {
        correctAnswer: "SSL performance",
        options: [
          "failure isolation",
          "HA capabilities",
          "management capabilities",
          "SSL performance",
        ],
        question:
          "What is a primary reason to choose hardware over virtual devices?",
      },
      {
        correctAnswer: "configure a tagged VLAN",
        options: [
          "configure VLAN with Link Aggregation Control Protocols (LACP)",
          "configure a tagged VLAN",
          "configure an untagged VLAN",
          "configure VLAN to use interface with Multiple Spanning Tree Protocol (MSTP)",
        ],
        question:
          "A new VLAN segment has been added to the network. Only the existing connected interface may be used. What should the BIG-IP Administrator do to allow traffic\nto both the existing and the new VLAN?",
      },
      {
        correctAnswer: "F5 update Service",
        options: ["BIG-IP", "User A", "F5 update Service", "web application"],
        question:
          "BIG-IP ASM is requesting automatic signature updates from the F5 update service\nWho is considered the server in this communication?",
      },
      {
        correctAnswer: "Device Management > Traffic Groups > traffic-group-1",
        options: [
          "System > Configuration Device General > lraffic-group-1",
          "Local Traffic > Traffic Class > traffic -group-1",
          "Device Management > Traffic Groups > traffic-group-1",
          "Network > ARP Static List > traffic-group-1",
        ],
        question:
          "A BIG-IP Administrator needs to configure a MAC masquerade address for traffic-group 1. Where on the GUI should this configuration be performed?",
      },
      {
        correctAnswer:
          "when the number of TCP connections to the server must be optimized",
        options: [
          "when IP Anycastmg is enabled",
          "when routing is enabled",
          "when the number of TCP connections to the server must be optimized",
          "when the client TCP connections options must be sent to the server",
        ],
        question: "in which scenario is a full proxy TCP connection required?",
      },
      {
        correctAnswer:
          "Ensuring requests from a single source always end up being handled by the same server.",
        options: [
          "Ensuring requests from a single source always end up being handled by the same server.",
          "the ability to associate different HTTP requests to a single user so that activity can be tracked.",
          "Keeping TLS session key information in memory so sessions can be quickly resumed",
          "the ability to keep idle connections open as long as possible by sending dummy traffic periodically",
        ],
        question:
          'In the context of load balancing, what does the term persistence" refer to?',
      },
      {
        correctAnswer: "Statics > Dashboard",
        options: [
          "Statistics > Utilization",
          "System . Utilization",
          "Statics > Dashboard",
          "System > Services",
        ],
        question:
          "An administrator suspects that a BIG IP appliance is experiencing performing issue due to spikes in CPU usage checks the performance issues does to spikes in\nCPU usage checks the performance report in the BIG-IP UI on CPU spikes are evident in the graphs. Which section in the BIG IP UI can the administrator check to\ntroubleshoot the issue further?",
      },
      {
        correctAnswer: "df-h",
        options: ["parted-1", "fdisk-1", "isbik", "df-h"],
        question:
          'An administrator notices the following log message generated by a BIG IP system " diskmonitor 011d005: Disk partition shared has less than 30% tree" Which\ncommand should the administrator use to troubleshoot the problem?',
      },
      {
        correctAnswer: "Network",
        options: ["Transport", "Session", "Network", "Presentation"],
        question:
          "In wh.ch layer of the OSI model is the data transported in the form of a packet?",
      },
      {
        correctAnswer: "when users work remotely",
        options: [
          "when users are unable to install software on their PC",
          "when users require a secure connection to the corporate network",
          "when users work remotely",
          "when users require the ability to RDP to internal resources",
        ],
        question:
          "in which scenario would an SSL VPN solution have an advantage over an IPSec VPN?",
      },
      {
        correctAnswer: "caching",
        options: ["persistence", "SSL offloading", "Compression", "caching"],
        question:
          "Which techology can be used on a BIG-IP device to accelerate the delivery of the same content to multiple user?",
      },
      {
        correctAnswer: "Public Key",
        options: [
          "Public Key",
          "SSL extension",
          "A negotiated security algorithm",
          "private Key",
        ],
        question:
          "A messaging system digitally signs messages to ensure non-repudiation of the sender. Which component should the receiver use to validate the message?",
      },
      {
        correctAnswer: "During an active FTP session",
        options: [
          "During an active FTP session",
          "When an SMTP connection",
          "During an SMTP connection",
          "When browsing websites",
        ],
        question:
          "In which scenario does the client act as a server?\nPassing Certification Exams Made Easy\nvisit - https://www.surepassexam.comRecommend!! Get the Full 101 dumps in VCE and PDF From SurePassExam\nhttps://www.surepassexam.com/101-exam-dumps.html (240 New Questions)",
      },
      {
        correctAnswer: "reduces latency",
        options: [
          "allows for SSL offload",
          "reduces latency",
          "allows for manipulation of HTTP headers",
          "handles larger packet sizes",
        ],
        question: "What is an advantage of packet forwarding architecture?",
      },
      {
        correctAnswer: "The Web application server",
        options: [
          "The User",
          "The Big-IP",
          "The Database",
          "The Web application server",
        ],
        question:
          "Exhibit.\nthe Web application Server made a query to the Database to present dynamic content for a user who would be the client?",
      },
      {
        correctAnswer: "type A",
        options: ["type NS", "type A", "type AAAA", "type MX"],
        question:
          "An IPv4 client tries to access to http://www myserver com\nWhich type of DNS request should the client send to its configured DNS server?",
      },
      {
        correctAnswer:
          "a route for 0. 0. 0.0/0 on Branch1 to Core1, and a route for 192 168 1 0/24 from Core 1 to Branch1",
        options: [
          "a route for 0. 0. 0.0/0 on Branch1 to Core1, and a route for 192 168 1 0/24 from Core 1 to Branch1",
          "a route for 0. 0. 0.0/0 on Core 1 to Branch1. and a route (or 192 168 1.0/24 from Branch 1 to Core.",
          "only a route for 192 168 0 0724 from Corel to Branch1",
          "only a route for 0. 0.0.0/0 on Branch1 to Core1",
        ],
        question:
          "A company recentlyopened a new branch site. The site needs to access the internet through a link to HQ.Therouter at the branch Branch1 the router at HQ is\nCalled core1. The computers at the branch site reside on the network 192 168 1 0/24 directly connected to Branch1 Users at HQ can already access the\nInternet.What routing must be configured to achieve the required internet connectivity for the branch site?",
      },
      {
        correctAnswer: "persistence profile",
        options: [
          "caching profile",
          "TCP profile",
          "persistence profile",
          "security policy",
        ],
        question:
          "A BIG-IP Administrator needs to make sure that requests from a single user are directed to the server that was initially selected (unless that server is marked\ndown). What should the administrator configure?",
      },
      {
        correctAnswer: "using the client source port",
        options: [
          "using the TCP sequence number",
          "using the client source port",
          "using the TCP acknowledgement number",
          "using the server source port",
        ],
        question:
          "A client\u2019s operating system needs to make sure that data received from a server is mapped to the application that requested it.\nHow does it complete this mapping?",
      },
      {
        correctAnswer: "HTTP",
        options: ["RDP", "HTTPS", "DNS", "HTTP"],
        question:
          "BIG-IP Administrator performs the capture as shown in the image! On which protocol is the application responding?",
      },
      {
        correctAnswer: "create/net route 10. 11. 1/32 gw 192 168. 1. 1",
        options: [
          "create/net route 10. 11. 1/32 gw 192 168. 1. 1",
          "create met route 192 168. 1. 1/32 gw 10. 11. 1",
          "add met route 192. 168. 1. 1/32 gw 10. 1. 1. 1",
          "add inet route 10.11.1/32 gw 192. 168.1.1",
        ],
        question:
          "A BIG-IP Administrator needs to create a route to send traffic destined to 10.1.1 1 to another router with an address of 192 168 1 1 Which TMSH command should\nthe administrator use?",
      },
      {
        correctAnswer: "Active-standby is less complex to troubleshoot",
        options: [
          "Active-standby configuration allows for the backup of the peer configuration",
          "Active-standby utilizes the hardware more efficiently",
          "Active standby Uses significantly less power consumption than active-active",
          "Active-standby is less complex to troubleshoot",
        ],
        question:
          "What advantage does an active-standby configuration have over an active-active configurations?",
      },
      {
        correctAnswer: "Determining a client or server should be trusted",
        options: [
          "Creating anonymous connections on the internet",
          "anchoring the geographic location of a client or server",
          "Ensuring multiple layers of decryption and encryption",
          "Determining a client or server should be trusted",
        ],
        question: "A certificate chain can be used for which purpose?",
      },
      {
        correctAnswer: "heartbeat detection",
        options: [
          "Hashed unit iD",
          "management MAC address",
          "resource utilization",
          "heartbeat detection",
        ],
        question:
          "In an active/standby high-availability mode, what causes a standby unit to assume the active role?",
      },
      {
        correctAnswer: "icontrol",
        options: ["icontrol", "iCatl", "iApp", "iRules"],
        question:
          "An administrator needs to prepare change control documents for operations staff To reduce possible errors the administrator killed number of default configuration\nPassing Certification Exams Made Easy\nvisit - https://www.surepassexam.comRecommend!! Get the Full 101 dumps in VCE and PDF From SurePassExam\nhttps://www.surepassexam.com/101-exam-dumps.html (240 New Questions)\noptions is choose from. Which F5 feature is intended to help with this task?",
      },
      {
        correctAnswer: "when compression is actuated",
        options: [
          "when compression is actuated",
          "When Source NAT configured",
          "when a virtual server is configured",
          "When Source IP persistence is required",
        ],
        question: "in which scenario is a full proxy TCP connection required?",
      },
      {
        correctAnswer: "Anycast",
        options: ["Broadcast", "Unicast", "Anycast", "Micest"],
        question:
          "A company would like to create a web service for multiple data centers (US EU, ASia) where each data center uses the same IP address Requests will be routed\nto the closest data center. Which address type is the appropriate solution?",
      },
      {
        correctAnswer:
          "to modify application traffic between the client and server",
        options: [
          "to modify application traffic between the client and server",
          "to create a reuseable application delivery template",
          "to integrate a BIG IP into an enterprise orchestration tool",
          "to create an accelerated session between two BIG-IP devices",
        ],
        question: "What is a common use of an iRule?",
      },
      {
        correctAnswer: "Fewer TCP connections will need to be opened",
        options: [
          "HTTP connections will remain open longer",
          "Fewer TCP connections will need to be opened",
          "HTTP connections will close when the keep-alive times out",
          "More TCP connections will need to be opened",
        ],
        question:
          "An Administrator enables HTTP keep alive. How does this affect the network?",
      },
      {
        correctAnswer: "traceroute",
        options: ["curt", "tcpdump", "traceroute", "nslookup"],
        question: "ICMP is used by which command line tool?",
      },
      {
        correctAnswer: "named is down",
        options: ["bigd is down", "named is down"],
        question:
          "Given the service list of a server shown, the administrator needs to determine why users are unable to resolve the IP addresswww.example.com.\nWhat is the causing this issue?",
      },
      {
        correctAnswer: "192 168:0. 129/25",
        options: [
          "192. 168.:0 177/25",
          "192 168:0. 129/25",
          "192.168:0 128/25",
          "192 168 :0 255/25",
        ],
        question:
          "Which of the following is a valid IP address and prefix length?",
      },
      {
        correctAnswer: "IP addresses and hardware addresses",
        options: [
          "IP addresses and hardware addresses",
          "Hardware addresses and VLAN",
          "VLAN and IP addresses",
          "Hostnames and IP addresses",
        ],
        question: "ARP provides translation between which two address types?",
      },
      {
        correctAnswer: "BIG-IQ",
        options: ["iHealthy", "BIG-IQ", "GTM", "LTM"],
        question:
          "A company deploys F5 load balancers to manage a large number of secure applications. The company manage certificates. Which F5 provides this functionality?",
      },
      {
        correctAnswer: "OPTIONS",
        options: ["OPTIONS", "TRACE", "LIST", "GET"],
        question:
          "A client needs to learn if a web server supports POST Which HTTP method is used?",
      },
      {
        correctAnswer:
          "Virtual server using client SSL profile configured to use the certificate",
        options: [
          "HTTP profile using client SSL profile",
          "Virtual server using client SSL profile configured to use the certificate",
          "Virtual server using server SSL profile configured to use the certificate",
          "HTTP profile using server SSL profile",
        ],
        question:
          "What should the BIG-IP Administrator configure to perform SSL offloading when the certificate is already imported on the BIG-IP device?",
      },
      {
        correctAnswer: "routing loop",
        options: [
          "routing loop",
          "packets that are routed with a high metric",
          "multiple paths toward the destination",
        ],
        question:
          "Ping and Traceroute outputs are provided for a connectivity issue. What is the cause of these results?",
      },
      {
        correctAnswer: "Source IP Address",
        options: [
          "Source IP Address",
          "HTTP Request Headers",
          "Cookies",
          "HTTP Response Headers",
        ],
        question:
          "Without decrypting, what portion of an HTTPS session is visible with a packet capture?",
      },
      {
        correctAnswer: "LLC",
        options: ["LLC", "ARP", "MAC", "UDP"],
        question:
          "Which Datalink sublayer has the primary funcl.cn of proving node lo node flow and error control?",
      },
      {
        correctAnswer: "synchronize the settings of device 1 to the group",
        options: [
          "synchronize the settings of device 1 to the group",
          "create a new cluster on device 1",
          "create the new virtual server on device 2",
          "synchronize the settings of the group to device 1",
        ],
        question:
          "A BIG-IP Administrator has a cluster of devices.\nWhat should the administrator do after creating a new Virtual Server on device 1?",
      },
      {
        correctAnswer:
          "so that application traffic can do gracefully resumed after a failover",
        options: [
          "so that a spanning tree loop can be avoided",
          "so that application traffic can do gracefully resumed after a failover",
          "so that configuration Updates can occur instantly between two devices",
          "so that the load can be shared equally between the devices",
        ],
        question:
          "Why is it important that devices in a high availability pair share the same configuration?",
      },
      {
        correctAnswer: "SSL VPN",
        options: ["GRE Tunnel", "iPsec VPN", "SSH Tunnel", "SSL VPN"],
        question:
          "A BIG-IP Administrator needs a solution to tunnel traffic and transmit encrypted connections over the Internet using only a standard browser and common ports\nand protocols. Which solution should the administrator select?",
      },
      {
        correctAnswer: "The remote server is actively rejecting the connection",
        options: [
          "The remote server is not responding because it is down",
          "The client machine is not 'connected to the internet",
          "The client machine's DNS is configured incorrectly",
          "The remote server is actively rejecting the connection",
        ],
        question:
          "A user is trying to access a website using the URL https://1.1.1.1/ The website fails to load. The user can access other websites. Given the packet capture above,\nwhat is the most likely issue?",
      },
      {
        correctAnswer: "2",
        options: ["4", "8", "6", "2"],
        question:
          "An administrator is given the IP Address of 192.168.100.124 and needs 64 subnets. How many hosts per network are allowed?",
      },
      {
        correctAnswer: "the ADC",
        options: [
          "the ADC",
          "the switch",
          "the server",
          "the client workstation",
        ],
        question:
          "In a fully proxy architecture, what is considered the client in the server-side communications",
      },
      {
        correctAnswer: "ARP",
        options: ["Ping", "ICMP", "RARP", "ARP"],
        question:
          "The BIG IP device is connected to the same network as a server\nWhich communication protocol will the BIG IP device use to discover the link layer address of the server?",
      },
      {
        correctAnswer: "certificate-based authentication",
        options: [
          "trust ID",
          "device group identification",
          "certificate-based authentication",
          "unit IDs",
        ],
        question:
          "What is used to establish trust relationships between BIG-IP devices?",
      },
      {
        correctAnswer: "Pool members B and C",
        options: [
          "Pool members A and C",
          "Pool members A B and C",
          "Pool members B and C",
          "Pool members A and B",
        ],
        question:
          "HTTP pool attached to a Virtual Server has three members Pool member A default HTTP monitor in red Pool member 6 custom HTTP monitor in green Pool\nmember C does not monitor\nWhich pool members participate in the load balancing?",
      },
      {
        correctAnswer: "change web server configuration to use SSL/TLS",
        options: [
          "change web server configuration to use SSL/TLS",
          "reboot the server",
          "restart the web service",
          "change web server configuration lo use SSH/SCP",
        ],
        question:
          "A BIG IP Administrator needs to create a virtual server for a new secure end-to-end web application After change in configuration the virtual server .3 still marked\ndown. The configuration of the virtual server and the pool member are correct. A quick server shows the status.\nTo fix the issue, what should the BIG-IP Administrator inform the web server administrator to do?",
      },
      {
        correctAnswer: "Positive security model",
        options: [
          "ACL Security model",
          "closed security model",
          "Negative security model",
          "Positive security model",
        ],
        question:
          "Which security model provides protection from unknown attacks?",
      },
      {
        correctAnswer: "tcpdump",
        options: ["netstat", "map", "tcpdump", "ifconsfig"],
        question:
          "ATP administrator recently added a new VLAN and needs to confirm that the BIG IP sees traffic on this VLAN. The VLAN is untagged on interface 1.1 and is\nnamed VLAN704 in the BIG IP Configuration Unity.\nWhich tool should be used to generate a packet capture that shows all traffic on this VLAN?",
      },
      {
        correctAnswer: "The server is unable to accept more data",
        options: [
          "The server is unable to accept more data",
          "The server resets the connection",
          "The client runs out of network buffers",
          "The server reaches its maximum segment size",
        ],
        question:
          "A client is transmitting a large amount of data to a server During this process, the server sets the window size to zero What is the likely cause of this issue?",
      },
      {
        correctAnswer: "Syslong",
        options: ["SNMP", "Syslong", "SMTP", "DNS"],
        question:
          "Which support service is required to synchrony the time stamps in system logs from these devices?",
      },
      {
        correctAnswer: "dig www example com",
        options: [
          "telnet www example com 80",
          "curl http //www example com",
          "dig www example com",
          "telnet 10.10.1. 110. 80",
        ],
        question:
          "Web application http://www.example.com at 10.10.1.1.110, is unresponsive. A recent change migrated DNS to a new platform",
      },
      {
        correctAnswer: "Least connections",
        options: [
          "Priority group activate",
          "Least connections",
          "Static ration",
          "Round robin",
        ],
        question:
          "An application has a mix of both and short and long lived connections. Which algorithm would provide and event distributionof all connections across the pool?",
      },
      {
        correctAnswer: "exclude devices from certain Sync Groups",
        options: [
          "synchronize only certain folders",
          "exclude devices from certain Traffic Groups",
          "exclude devices from certain Sync Groups",
          "exclude devices from certain Device Groups",
        ],
        question:
          "Which method should an administrator of the BIG-IP use to sync the configuration to only certain other BIG-IPs?",
      },
      {
        correctAnswer:
          "The requested resource resides temporary under a different URI",
        options: [
          "The server encountered an unexpected condition that prevented it from Milling the request.",
          "The server has not found anything matching the Request URI",
          "The request has succeeded.",
          "The requested resource resides temporary under a different URI",
        ],
        question: "What does response code HTTP 302 represent?",
      },
      {
        correctAnswer: "sync-failover",
        options: ["Sync-active", "sync-failover", "sync-standby", "sync-only"],
        question:
          "Which device group type allows a BIG IP system to automatically become active in the event that the current active system fails?",
      },
      {
        correctAnswer: "Switch",
        options: ["Router", "Firewall", "Application Server", "Switch"],
        question:
          "Which device type in the topology will forward network packets without an OSI layer 3 address assigned to a data plane interface?",
      },
      {
        correctAnswer: "ntpq",
        options: ["time", "ntpdate", "date", "ntpq"],
        question:
          "A BIG IP Administrator configures three Network Time Protocol servers to keep the time of the devices in sync. Which tool should the administrator use to show\nthe synchronization status with the Network Time Protocol servers?",
      },
      {
        correctAnswer: "RST",
        options: ["FiN", "RST", "ACK", "SYN"],
        question:
          "After all expected HTTP data has been sent from a server to a client, the client does not close connection. The server reaps the connection, but after that the client\nsends a \u2018\u2019Keep alive \u2018\u2019packet to the server.\nWhich type of packet will the server respond with?",
      },
      {
        correctAnswer: "Layer 7",
        options: ["Layer 7", "Layer 4", "Layer 2", "Layer 3"],
        question:
          "At which layer of the OSJ model does the DNS resolution process occur?",
      },
      {
        correctAnswer: "single sign on",
        options: [
          "RADIUS",
          "single sign on",
          "multifactor authentication",
          "LDAP",
        ],
        question:
          "If there are multiple applications authenticated against a single identity store, which technology solution will simplify access to all applications?",
      },
      {
        correctAnswer: "(Rules",
        options: ["iControI", "(Rules", "lApps", "(Health"],
        question:
          "A company needs to use a custom value when making persistence decisions.Which F5 product provides this functionality?",
      },
      {
        correctAnswer: "2001 0db8.85a3 0000 0000 8a2e 0370 7334",
        options: [
          "2001 0db8.85a3 0000 0000 8a2e 0370 7334",
          "2001:db8:85a3 Bd3.Ba2e.370 7334",
          "2001:0db8:85i3:0000:0000: : 8a2i:0370:7334",
        ],
        question:
          "An administrate receives an error message when attempting to create a self-IP address on a BIG-IP appliance Which address should the administrator use to\nresolve the issue?",
      },
      {
        correctAnswer: "Server Name indication",
        options: [
          "Session Tickets",
          "OCSP Staping",
          "Server Name indication",
          "Certificate Status Request",
        ],
        question:
          "Which TransportLayer Security (TLS) extension can be used to enable a single virtual server to serve multiple HTTPS websites in different can be used to enable\na single virtual server to server domains?",
      },
      {
        correctAnswer: "data validation",
        options: [
          "data modification",
          "data encryption",
          "data validation",
          "data decryption",
        ],
        question:
          "Cryptographic hash functions can be used to provide which service?\nPassing Certification Exams Made Easy\nvisit - https://www.surepassexam.comRecommend!! Get the Full 101 dumps in VCE and PDF From SurePassExam\nhttps://www.surepassexam.com/101-exam-dumps.html (240 New Questions)",
      },
      {
        correctAnswer: "tcpdump",
        options: ["leinel", "traceroute", "ping", "tcpdump"],
        question:
          "A BIG IP Administrator need to perform a packet capture and identify the source IP that is connecting to the Virtual Server.\nWhich utility should the administrator use on the BIG IP device?",
      },
      {
        correctAnswer: "ASM",
        options: ["ASM", "APM", "AFM", "GTM"],
        question:
          "An administrator needs to protect a web application from cross-site scripting (CSS) exploits. Which F5 protocol provide this functionality",
      },
      {
        correctAnswer: "ARP",
        options: ["ARP", "TCP", "IPv4", "BGP"],
        question:
          "What are two examples of network layer protocols? (Choose two)",
      },
      {
        correctAnswer: "when compression is enabled",
        options: [
          "when SIP UP P load balancing is defined",
          "when DNS load balancing is configured",
          "when compression is enabled",
          "when layer 3 load balancing is configured",
        ],
        question: "in which scenario is a full proxy TCP connection required?",
      },
      {
        correctAnswer: "positive security model",
        options: [
          "context-based access control mode!",
          "role-based access control mode!",
          "negative security model",
          "positive security model",
        ],
        question:
          "Which security mode. functions by defining what traffic is allowed and rejecting all other traffic?",
      },
      {
        correctAnswer: "iRules",
        options: ["iRules", "SSL profiles", "Proxy SSL", "SPDY"],
        question:
          "An administrator needs to rapidly deter e newly discovered security threat to a remote desktop application. Which F5 feature provides this functionality?",
      },
      {
        correctAnswer: "Ratio",
        options: ["Least Connections", "Fastest", "Ratio", "Round Robin"],
        question:
          "A server is capable of handling more connections than other servers in the same pool. Which load distribution method should the administrator choose?",
      },
      {
        correctAnswer: "Link Aggregation Control Protocol (LACP)",
        options: [
          "Link Aggregation Control Protocol (LACP)",
          "Link Allocation & Configuration Protocol (LACP)",
          "Link Local Distribution Protocol (LLDP)",
          "Link Layer Discovery Protocol (LDP)",
        ],
        question:
          "An administrator needs to connect a new device to a switched network. The interconnect must be both redundant and combined bandwidth than a single link\nWhich low-level protocol will help facilitate this?",
      },
      {
        correctAnswer:
          "The larger Key size will increase processing requirements",
        options: [
          "The larger Key size will increase processing requirements",
          "Some hardware will NOT support the 2048 key",
          "Some certificate authorities will NOT support the 2048 key",
          "The larger key sire will increase private key installation complexity",
        ],
        question:
          "An administrator is updating private keys used for SSL encryption from 1024 to 2048 bits. Which possible effect should the administrator consider when performing\nthis activity?",
      },
      {
        correctAnswer: "Negative",
        options: ["Positive", "Context-based", "Negative", "Role-based"],
        question:
          "The use of attack signature within an intrusion Detection System (IDS) is an application of which security model?",
      },
      {
        correctAnswer: "multicasting to the local subnet",
        options: [
          "loopback to itself",
          "broadcasting to the local subnet",
          "multicasting to the local subnet",
          "automatic private IP addressing",
        ],
        question:
          "If a workstation is configured with an address of 224 0.0.1 which functionality will it allow?",
      },
    ],
  };

  // Function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Function to display a question
  function displayQuestion(question, callback) {
    if (!questionTextElement || !optionsContainer) {
      console.error(
        "Missing HTML elements. Make sure they exist and the script is placed after them.",
      );
      return;
    }

    // Display the question
    questionTextElement.textContent = question.question;

    // Shuffle options for a random order
    const shuffledOptions = question.options.slice();
    shuffleArray(shuffledOptions);

    // Clear previous options
    optionsContainer.innerHTML = "";

    // Display the options
    shuffledOptions.forEach(function (option) {
      const optionButton = document.createElement("button");
      optionButton.textContent = option;
      optionButton.classList.add(
        "option",
        "p-2",
        "px-4",
        "my-2",
        "mx-1",
        "btn",
        "btn-primary",
        "btn-sm",
      );
      optionsContainer.appendChild(optionButton);
    });

    // Call the callback function after displaying options
    if (callback && typeof callback === "function") {
      callback();
    }
  }

  // Function to reset the game
  function resetGame() {
    score = 0;
    currentQuestionIndex = 0;
    updateScore();
    selectCategory(quizCode); // Set default category based on quizCode
    displayNextQuestion();
    tryAgainButton.style.display = "none"; // Hide the "Try Again" button
    feedbackMessageElement.textContent = ""; // Clear the feedback message
    optionsContainer.querySelectorAll(".option").forEach(function (option) {
      option.disabled = false; // Enable all options
      option.classList.remove("btn-success", "btn-danger", "btn-light"); // Reset option button styles
      option.classList.add("btn-primary"); // Set the default button style
    });
  }

  // Function to update the score display
  function updateScore() {
    correctCountElement.textContent = score;
    wrongCountElement.textContent = currentQuestionIndex - score;
  }

  // Function to handle user's answer
  function checkAnswer(answer) {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion && answer === currentQuestion.correctAnswer) {
      feedbackMessageElement.textContent = "Congratulations!! Correct answer.";
      feedbackMessageElement.style.color = "green"; // Set feedback message color to green for correct answers
      score++;
      optionsContainer.querySelectorAll(".option").forEach(function (option) {
        if (option.textContent === currentQuestion.correctAnswer) {
          option.classList.add("btn-success");
        } else {
          option.classList.remove("btn-primary");
          option.classList.add("btn-light"); // Reset other options to default color
          option.disabled = true; // Disable other options after correct answer
        }
      });
    } else {
      feedbackMessageElement.textContent =
        "Wrong Answer! The correct answer was: " +
        currentQuestion.correctAnswer;
      feedbackMessageElement.style.color = "red"; // Set feedback message color to red for incorrect answers
      optionsContainer.querySelectorAll(".option").forEach(function (option) {
        if (option.textContent === answer) {
          option.classList.add("btn-danger");
          option.disabled = true; // Disable the selected option after wrong answer
        }
      });
    }

    currentQuestionIndex++;
    updateScore();

    // Check if all questions are answered
    if (currentQuestionIndex < getCurrentQuestionSet().length) {
      // Pass displayNextQuestion as a callback to displayQuestion
      displayQuestion(getCurrentQuestion(), displayNextQuestion);
    } else {
      // All questions answered, display score and try again button
      displayScore();
      displayTryAgainButton();
    }
  } // Function to get the current question based on the category and index
  function getCurrentQuestion() {
    const questionSet = questionSets[currentCategory];

    if (currentQuestionIndex < questionSet.length) {
      return questionSet[currentQuestionIndex];
    } else {
      // All questions have been answered, you may want to handle this case
      return null;
    }
  }

  // Function to get the current question set based on the category
  function getCurrentQuestionSet() {
    return questionSets[currentCategory];
  }

  // Function to display the next question
  function displayNextQuestion() {
    const currentQuestion = getCurrentQuestion();

    if (currentQuestion) {
      displayQuestion(currentQuestion);
    } else {
      // No more questions, you may want to handle this case
      console.log("Quiz completed!");
    }
  }

  // Function to display the score
  function displayScore() {
    questionTextElement.textContent =
      "Quiz completed! Your score: " +
      score +
      " out of " +
      getCurrentQuestionSet().length;
    feedbackMessageElement.textContent = "";
    optionsContainer.querySelectorAll(".option").forEach(function (option) {
      option.disabled = true; // Disable all options after quiz completion
    });
  } // Function to display the "Try Again" button
  function displayTryAgainButton() {
    optionsContainer.querySelectorAll(".option").forEach(function (option) {
      option.disabled = true;
    });
    tryAgainButton.style.display = "block";
  }

  // Function to select the category
  function selectCategory(category) {
    currentCategory = category;
  }

  // Add event listener to handle button clicks using event delegation
  optionsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("option")) {
      checkAnswer(event.target.textContent);
    }
  });

  // Try Again button click event
  tryAgainButton.addEventListener("click", resetGame);

  // Initial setup
  resetGame();
});
