document.addEventListener("DOMContentLoaded", function() {
// Get the required HTML elements
const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const feedbackMessageElement = document.getElementById('feedback-message');
const correctCountElement = document.getElementById('correct-count');
const wrongCountElement = document.getElementById('wrong-count');
const tryAgainButton = document.getElementById('try-again-button');

// Get the code from the query parameter or the window.quizCode variable
var urlParams = new URLSearchParams(window.location.search);
var codeFromUrl = urlParams.get('code');
var quizCode = codeFromUrl || window.quizCode || "nmap101"; // Use code from URL, window.quizCode variable, or default to "h01"

// Game state variables
let score = 0;
let currentQuestionIndex = 0;
let currentCategory = quizCode;

  // Define question sets
  var questionSets = {

"nmap101": [
{"correctAnswer": "TCP connect", "options": ["TCP connect", "SYN", "ACK", "FIN"], "question": "What is the most reliable method for Nmap to determine if a port is open or closed?"},
{"correctAnswer": "-p-", "options": ["-p1-1000", "-p-", "-p80,443,22", "-pU:53,T:21-25"], "question": "What Nmap flag is used to scan all 65535 ports?"},
{"correctAnswer": "-sV", "options": ["-sV", "-sS", "-sU", "-sX"], "question": "Which Nmap flag enables version detection to determine the service/version on an open port?"},
{"correctAnswer": "-sC", "options": ["-sV", "-sC", "-sS", "-sX"], "question": "Which Nmap flag is used to run default nmap scripts for further enumeration?"},
{"correctAnswer": "-Pn", "options": ["-Pn", "-sn", "-sV", "-sC"], "question": "What Nmap flag is used to skip host discovery and scan the specified target(s)?"},
{"correctAnswer": "Yes", "options": ["Yes", "No"], "question": "Can Nmap be used to perform vulnerability scanning on remote hosts?"},
{"correctAnswer": "firewall", "options": ["firewall", "antivirus", "IDS", "proxy"], "question": "What type of security system might block or interfere with Nmap scans?"},
{"correctAnswer": "nmap-vulners", "options": ["nmap-vulners", "nmap-scripts", "nmap-services", "nmap-version"], "question": "What is the name of the Nmap script that checks for vulnerabilities on open services?"},
{"correctAnswer": "-sn -PE -PP -PM", "options": ["-sn -PE -PP -PM", "-Pn", "-sV", "-sC"], "question": "What combination of Nmap flags can be used for ping scan to find active hosts?"},
{"correctAnswer": "-oN", "options": ["-oX", "-oG", "-oN", "-oA"], "question": "Which Nmap flag is used to save the output in normal format (human-readable)?"},
{"correctAnswer": "-sU", "options": ["-sS", "-sT", "-sU", "-sY"], "question": "Which Nmap flag is used to perform a UDP scan?"},
{"correctAnswer": "-sN", "options": ["-sF", "-sN", "-sX", "-sI"], "question": "Which Nmap flag is used for TCP Null scan?"},
{"correctAnswer": "-sF", "options": ["-sF", "-sN", "-sX", "-sI"], "question": "Which Nmap flag is used for TCP FIN scan?"},
{"correctAnswer": "-sA", "options": ["-sW", "-sA", "-sM", "-sZ"], "question": "Which Nmap flag is used for TCP ACK scan?"},
{"correctAnswer": "-sW", "options": ["-sW", "-sA", "-sM", "-sZ"], "question": "Which Nmap flag is used for TCP Window scan?"},
{"correctAnswer": "-sM", "options": ["-sW", "-sA", "-sM", "-sZ"], "question": "Which Nmap flag is used for TCP Maimon scan?"},
{"correctAnswer": "-f", "options": ["-f", "--mtu", "--data-length", "--scan-delay"], "question": "Which Nmap flag is used to fragment packets?"},
{"correctAnswer": "--data-length", "options": ["-f", "--mtu", "--data-length", "--scan-delay"], "question": "Which Nmap flag is used to specify the length of the TCP data payload?"},
{"correctAnswer": "--scan-delay", "options": ["-f", "--mtu", "--data-length", "--scan-delay"], "question": "Which Nmap flag is used to specify the delay between each probe sent?"},
{"correctAnswer": "-sI", "options": ["-sF", "-sN", "-sX", "-sI"], "question": "Which Nmap flag is used for idle/zombie scan?"},
{"correctAnswer": "-D", "options": ["-D", "-S", "--proxies", "--source-port"], "question": "Which Nmap flag is used to specify a decoy IP address?"},
{"correctAnswer": "-S", "options": ["-D", "-S", "--proxies", "--source-port"], "question": "Which Nmap flag is used to specify a source IP address?"},
{"correctAnswer": "--proxies", "options": ["-D", "-S", "--proxies", "--source-port"], "question": "Which Nmap flag is used to specify a proxy server to use for scanning?"},
{"correctAnswer": "--source-port", "options": ["-D", "-S", "--proxies", "--source-port"], "question": "Which Nmap flag is used to specify a source port number?"},
{"correctAnswer": "-sV --version-intensity", "options": ["-sV --version-intensity", "-sV --version-light", "-sV --version-all", "-sV --version-trace"], "question": "Which Nmap flags are used to enable intense version detection?"},
{"correctAnswer": "-sV --version-light", "options": ["-sV --version-intensity", "-sV --version-light", "-sV --version-all", "-sV --version-trace"], "question": "Which Nmap flags are used to enable light version detection?"},
{"correctAnswer": "-sV --version-all", "options": ["-sV --version-intensity", "-sV --version-light", "-sV --version-all", "-sV --version-trace"], "question": "Which Nmap flags are used to enable all version detection techniques?"},
{"correctAnswer": "-sV --version-trace", "options": ["-sV --version-intensity", "-sV --version-light", "-sV --version-all", "-sV --version-trace"], "question": "Which Nmap flags are used to enable version detection and show details of the detection process?"},
{"correctAnswer": "-sV --script=banner", "options": ["-sV --script=banner", "-sV --script=http-title", "-sV --script=dns-brute", "-sV --script=smb-enum-shares"], "question": "Which Nmap flags are used to run the banner script to grab service banners?"},
{"correctAnswer": "-sV --script=http-title", "options": ["-sV --script=banner", "-sV --script=http-title", "-sV --script=dns-brute", "-sV --script=smb-enum-shares"], "question": "Which Nmap flags are used to run the http-title script to grab webpage titles?"},
{"correctAnswer": "-sV --script=dns-brute", "options": ["-sV --script=banner", "-sV --script=http-title", "-sV --script=dns-brute", "-sV --script=smb-enum-shares"], "question": "Which Nmap flags are used to run the dns-brute script to brute force DNS hostnames?"},
{"correctAnswer": "-sV --script=smb-enum-shares", "options": ["-sV --script=banner", "-sV --script=http-title", "-sV --script=dns-brute", "-sV --script=smb-enum-shares"], "question": "Which Nmap flags are used to run the smb-enum-shares script to enumerate SMB shares?"},
{"correctAnswer": "-sV --script=vuln", "options": ["-sV --script=vuln", "-sV --script=exploit", "-sV --script=auth", "-sV --script=brute"], "question": "Which Nmap flags are used to run scripts that check for vulnerabilities?"},
{"correctAnswer": "-sV --script=exploit", "options": ["-sV --script=vuln", "-sV --script=exploit", "-sV --script=auth", "-sV --script=brute"], "question": "Which Nmap flags are used to run scripts that attempt to exploit vulnerabilities?"},
{"correctAnswer": "-sV --script=auth", "options": ["-sV --script=vuln", "-sV --script=exploit", "-sV --script=auth", "-sV --script=brute"], "question": "Which Nmap flags are used to run scripts that attempt to bypass authentication mechanisms?"},
{"correctAnswer": "-sV --script=brute", "options": ["-sV --script=vuln", "-sV --script=exploit", "-sV --script=auth", "-sV --script=brute"], "question": "Which Nmap flags are used to run scripts that perform brute-force attacks?"},
{"correctAnswer": "--script-args", "options": ["--script-args", "--script-help", "--script-trace", "--script-updatedb"], "question": "Which Nmap flag is used to provide arguments to NSE scripts?"},
{"correctAnswer": "--script-help", "options": ["--script-args", "--script-help", "--script-trace", "--script-updatedb"], "question": "Which Nmap flag is used to get help information for NSE scripts?"},
{"correctAnswer": "--script-trace", "options": ["--script-args", "--script-help", "--script-trace", "--script-updatedb"], "question": "Which Nmap flag is used to enable trace output for NSE scripts?"},
{"correctAnswer": "--script-updatedb", "options": ["--script-args", "--script-help", "--script-trace", "--script-updatedb"], "question": "Which Nmap flag is used to update the script database?"},
{"correctAnswer": "-p-", "options": ["-p22", "-p22,80,443", "-p-", "-p1-1024"], "question": "Which Nmap flag is used to scan all ports from 1 to 65535?"},
{"correctAnswer": "-p1-1024", "options": ["-p22", "-p22,80,443", "-p-", "-p1-1024"], "question": "Which Nmap flag is used to scan ports from 1 to 1024?"},
{"correctAnswer": "-p22,80,443", "options": ["-p22", "-p22,80,443", "-p-", "-p1-1024"], "question": "Which Nmap flag is used to scan specific ports like 22, 80, and 443?"},
{"correctAnswer": "-p22", "options": ["-p22", "-p22,80,443", "-p-", "-p1-1024"], "question": "Which Nmap flag is used to scan only port 22?"},
{"correctAnswer": "--top-ports", "options": ["--top-ports", "--port-ratio", "--max-rtt-timeout", "--min-rtt-timeout"], "question": "Which Nmap flag is used to scan only the top X most common ports?"},
{"correctAnswer": "--port-ratio", "options": ["--top-ports", "--port-ratio", "--max-rtt-timeout", "--min-rtt-timeout"], "question": "Which Nmap flag is used to specify the port scan ratio?"},
{"correctAnswer": "--max-rtt-timeout", "options": ["--top-ports", "--port-ratio", "--max-rtt-timeout", "--min-rtt-timeout"], "question": "Which Nmap flag is used to specify the maximum round-trip time for TCP connections?"},
{"correctAnswer": "--min-rtt-timeout", "options": ["--top-ports", "--port-ratio", "--max-rtt-timeout", "--min-rtt-timeout"], "question": "Which Nmap flag is used to specify the minimum round-trip time for TCP connections?"},
{"correctAnswer": "-sn", "options": ["-sn", "-sP", "-Pn", "-n"], "question": "Which Nmap flag is used to perform a ping scan to determine which hosts are online?"},
{"correctAnswer": "-sP", "options": ["-sn", "-sP", "-Pn", "-n"], "question": "Which Nmap flag is used to perform a ping scan like -sn, but will also send TCP and UDP packets to open ports?"},
{"correctAnswer": "-Pn", "options": ["-sn", "-sP", "-Pn", "-n"], "question": "Which Nmap flag is used to skip host discovery and treat all specified hosts as online?"},
{"correctAnswer": "-n", "options": ["-sn", "-sP", "-Pn", "-n"], "question": "Which Nmap flag is used to disable DNS resolution and only show IP addresses in the output?"}
    ],


"burp101":[
{"correctAnswer": "Proxy", "options": ["Proxy", "Spider", "Scanner", "Repeater"], "question": "Which BurpSuite tool acts as an intermediary between the web browser and the target web application, allowing interception and modification of HTTP/HTTPS traffic?"},
{"correctAnswer": "Spider", "options": ["Proxy", "Spider", "Scanner", "Repeater"], "question": "Which BurpSuite tool is used to crawl and map the content and functionality of a website?"},
{"correctAnswer": "Scanner", "options": ["Proxy", "Spider", "Scanner", "Repeater"], "question": "Which BurpSuite tool is used to scan web applications for various vulnerabilities like SQL injection and XSS?"},
{"correctAnswer": "Repeater", "options": ["Proxy", "Spider", "Scanner", "Repeater"], "question": "Which BurpSuite tool is used to manually modify and resend HTTP requests?"},
{"correctAnswer": "Decoder", "options": ["Decoder", "Comparer", "Intruder", "Sequencer"], "question": "Which BurpSuite tool is used to encode and decode data in various formats?"},
{"correctAnswer": "Comparer", "options": ["Decoder", "Comparer", "Intruder", "Sequencer"], "question": "Which BurpSuite tool is used to visually compare different application responses?"},
{"correctAnswer": "Intruder", "options": ["Decoder", "Comparer", "Intruder", "Sequencer"], "question": "Which BurpSuite tool is used to automate customized attacks and test for vulnerabilities?"},
{"correctAnswer": "Sequencer", "options": ["Decoder", "Comparer", "Intruder", "Sequencer"], "question": "Which BurpSuite tool is used to analyze the randomness of session tokens?"},
{"correctAnswer": "Yes", "options": ["Yes", "No"], "question": "Can BurpSuite be used for both manual and automated web application security testing?"},
{"correctAnswer": "Interception", "options": ["Interception", "Scanning", "Exploitation", "Reporting"], "question": "What is the primary purpose of the Proxy tool in BurpSuite?"},
{"correctAnswer": "Scanning", "options": ["Interception", "Scanning", "Exploitation", "Reporting"], "question": "What is the primary purpose of the Scanner tool in BurpSuite?"},
{"correctAnswer": "Exploitation", "options": ["Interception", "Scanning", "Exploitation", "Reporting"], "question": "What is the primary purpose of the Intruder tool in BurpSuite?"},
{"correctAnswer": "Reporting", "options": ["Interception", "Scanning", "Exploitation", "Reporting"], "question": "What is one of the key features of BurpSuite that aids in collaboration and documentation?"},
{"correctAnswer": "Passive", "options": ["Active", "Passive", "Both", "Neither"], "question": "Which type of vulnerability scanning is performed by the Spider tool in BurpSuite?"},
{"correctAnswer": "Active", "options": ["Active", "Passive", "Both", "Neither"], "question": "Which type of vulnerability scanning is performed by the Scanner tool in BurpSuite?"},
{"correctAnswer": "Yes", "options": ["Yes", "No"], "question": "Can BurpSuite be used to test web applications running on different platforms and frameworks?"},
{"correctAnswer": "False", "options": ["True", "False"], "question": "Is it ethical to use BurpSuite to test web applications without proper authorization?"},
{"correctAnswer": "Replay", "options": ["Replay", "Fuzz", "Sniper", "Battering Ram"], "question": "Which attack type in the Intruder tool is used to resend the same request multiple times?"},
{"correctAnswer": "Sniper", "options": ["Replay", "Fuzz", "Sniper", "Battering Ram"], "question": "Which attack type in the Intruder tool is used to target specific parameters with payloads?"},
{"correctAnswer": "Battering Ram", "options": ["Replay", "Fuzz", "Sniper", "Battering Ram"], "question": "Which attack type in the Intruder tool is used to inject payloads in every possible position?"},
{"correctAnswer": "Fuzz", "options": ["Replay", "Fuzz", "Sniper", "Battering Ram"], "question": "Which attack type in the Intruder tool is used to send semi-random payloads to identify potential vulnerabilities?"},
{"correctAnswer": "Cookies", "options": ["Cookies", "Headers", "Parameters", "Request Body"], "question": "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?"},
{"correctAnswer": "Headers", "options": ["Cookies", "Headers", "Parameters", "Request Body"], "question": "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?"},
{"correctAnswer": "Parameters", "options": ["Cookies", "Headers", "Parameters", "Request Body"], "question": "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?"},
{"correctAnswer": "Request Body", "options": ["Cookies", "Headers", "Parameters", "Request Body"], "question": "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?"},
{"correctAnswer": "Yes", "options": ["Yes", "No"], "question": "Can BurpSuite be used to test web applications for vulnerabilities like SQL injection, XSS, and CSRF?"},
{"correctAnswer": "Collaborator Client", "options": ["Collaborator Client", "Collaborator Server", "Burp Collaborator", "Burp Hunter"], "question": "Which BurpSuite tool is used to generate a unique payload that can be used for external interaction and vulnerability detection?"},
{"correctAnswer": "Collaborator Server", "options": ["Collaborator Client", "Collaborator Server", "Burp Collaborator", "Burp Hunter"], "question": "Which BurpSuite component listens for interactions with the Collaborator Client payloads?"},
{"correctAnswer": "Yes", "options": ["Yes", "No"], "question": "Can BurpSuite be used to test the security of web services and APIs, in addition to traditional web applications?"},
{"correctAnswer": "Macros", "options": ["Macros", "Scripts", "Extensions", "Plugins"], "question": "Which feature in BurpSuite allows users to record and playback a series of actions?"},
{"correctAnswer": "Extensions", "options": ["Macros", "Scripts", "Extensions", "Plugins"], "question": "Which feature in BurpSuite allows users to add third-party extensions to enhance functionality?"},
{"correctAnswer": "XML", "options": ["XML", "JSON", "HTML", "Markdown"], "question": "Which data format is commonly used by BurpSuite for storing and sharing project data?"},
{"correctAnswer": "Yes", "options": ["Yes", "No"], "question": "Can BurpSuite be integrated with other security tools and frameworks?"},
{"correctAnswer": "Target", "options": ["Target", "Scope", "Site Map", "Issue Definitions"], "question": "Which BurpSuite feature is used to specify the target web application or website?"},
{"correctAnswer": "Site Map", "options": ["Target", "Scope", "Site Map", "Issue Definitions"], "question": "Which BurpSuite feature provides a hierarchical view of the mapped content and functionality of the target web application?"},
{"correctAnswer": "Scope", "options": ["Target", "Scope", "Site Map", "Issue Definitions"], "question": "Which BurpSuite feature is used to define the areas of the application that should be included or excluded from testing?"},
{"correctAnswer": "Issue Definitions", "options": ["Target", "Scope", "Site Map", "Issue Definitions"], "question": "Which BurpSuite feature is used to manage and configure the types of vulnerabilities that the Scanner should look for?"},
{"correctAnswer": "CSRF", "options": ["XSS", "SQLi", "CSRF", "LFI"], "question": "Which type of vulnerability can be detected and exploited using BurpSuite's Repeater tool?"},
{"correctAnswer": "SQLi", "options": ["XSS", "SQLi", "CSRF", "LFI"], "question": "Which type of vulnerability can be detected and exploited using BurpSuite's Intruder tool?"},
{"correctAnswer": "XSS", "options": ["XSS", "SQLi", "CSRF", "LFI"], "question": "Which type of vulnerability can be detected by BurpSuite's Scanner tool?"},
{"correctAnswer": "LFI", "options": ["XSS", "SQLi", "CSRF", "LFI"], "question": "Which type of vulnerability can be detected and exploited using BurpSuite's Repeater and Intruder tools?"},
{"correctAnswer": "HTTP Request Smuggling", "options": ["HTTP Request Smuggling", "XML External Entity", "Server-Side Request Forgery", "Insecure Deserialization"], "question": "Which type of vulnerability can be tested using BurpSuite's Repeater and Intruder tools, and may involve obfuscating or manipulating HTTP headers?"},
{"correctAnswer": "XML External Entity", "options": ["HTTP Request Smuggling", "XML External Entity", "Server-Side Request Forgery", "Insecure Deserialization"], "question": "Which type of vulnerability can be tested using BurpSuite's Repeater tool, and may involve exploiting XML parsers to read system files or perform other actions?"},
{"correctAnswer": "Server-Side Request Forgery", "options": ["HTTP Request Smuggling", "XML External Entity", "Server-Side Request Forgery", "Insecure Deserialization"], "question": "Which type of vulnerability can be tested using BurpSuite's Repeater and Collaborator tools, and involves causing the server to make unintended requests?"},
{"correctAnswer": "Insecure Deserialization", "options": ["HTTP Request Smuggling", "XML External Entity", "Server-Side Request Forgery", "Insecure Deserialization"], "question": "Which type of vulnerability can be tested using BurpSuite's Repeater and Intruder tools, and involves manipulating serialized data to execute arbitrary code or actions?"},
{"correctAnswer": "False", "options": ["True", "False"], "question": "Is it a good practice to use BurpSuite to test web applications without understanding the potential impact and consequences?"},
{"correctAnswer": "Engagement Rules", "options": ["Engagement Rules", "Scope Creep", "False Positives", "Performance Impact"], "question": "Which term refers to the defined boundaries and limitations of a web application security testing engagement?"},
{"correctAnswer": "Scope Creep", "options": ["Engagement Rules", "Scope Creep", "False Positives", "Performance Impact"], "question": "Which term refers to the unintended expansion of testing beyond the initially agreed-upon scope?"},
{"correctAnswer": "False Positives", "options": ["Engagement Rules", "Scope Creep", "False Positives", "Performance Impact"], "question": "Which term refers to vulnerabilities reported by a scanner that do not actually exist or pose a risk?"},
{"correctAnswer": "Performance Impact", "options": ["Engagement Rules", "Scope Creep", "False Positives", "Performance Impact"], "question": "Which term refers to the potential effect of security testing on the target web application's performance or availability?"},
{"correctAnswer": "BurpSuite Professional", "options": ["BurpSuite Community Edition", "BurpSuite Professional", "BurpSuite Enterprise Edition"], "question": "Which edition of BurpSuite includes advanced features like the Crawler, Scanner, and Intruder tools?"},
{"correctAnswer": "BurpSuite Community Edition", "options": ["BurpSuite Community Edition", "BurpSuite Professional", "BurpSuite Enterprise Edition"], "question": "Which edition of BurpSuite is free to use but has limited functionality?"},
{"correctAnswer": "BurpSuite Enterprise Edition", "options": ["BurpSuite Community Edition", "BurpSuite Professional", "BurpSuite Enterprise Edition"], "question": "Which edition of BurpSuite is designed for large organizations and includes support for team collaboration and centralized reporting?"}
],

"docker101": [
{"correctAnswer": "run", "options": ["run", "create", "start", "exec"], "question": "Which Docker command is used to create and start a container in one command?"},
{"correctAnswer": "ps", "options": ["ps", "ls", "status", "containers"], "question": "Which Docker command is used to list the running containers?"},
{"correctAnswer": "pull", "options": ["pull", "clone", "download", "fetch"], "question": "What Docker command is used to download a Docker image from a registry?"},
{"correctAnswer": "images", "options": ["images", "list", "show", "containers"], "question": "Which Docker command is used to list the locally available Docker images?"},
{"correctAnswer": "stop", "options": ["stop", "pause", "kill", "terminate"], "question": "Which Docker command is used to stop a running container?"},
{"correctAnswer": "rmi", "options": ["rmi", "remove", "delete", "erase"], "question": "What Docker command is used to remove/delete a Docker image?"},
{"correctAnswer": "logs", "options": ["logs", "stream", "show", "view"], "question": "Which Docker command is used to view the logs of a container?"},
{"correctAnswer": "exec", "options": ["exec", "run", "start", "shell"], "question": "What Docker command is used to run a command in a running container?"},
{"correctAnswer": "inspect", "options": ["inspect", "describe", "analyze", "details"], "question": "Which Docker command is used to get detailed information about a Docker object, such as a container or image?"},
{"correctAnswer": "network", "options": ["network", "net", "connect", "link"], "question": "What Docker command is used to manage Docker networks?"},
{"correctAnswer": "volume", "options": ["volume", "volumes", "data", "store"], "question": "Which Docker command is used to manage Docker volumes for persistent data?"},
{"correctAnswer": "build", "options": ["build", "create", "construct", "make"], "question": "What Docker command is used to build a Docker image from a Dockerfile?"},
{"correctAnswer": "tag", "options": ["tag", "label", "mark", "identify"], "question": "Which Docker command is used to tag a Docker image with a name and optional version?"},
{"correctAnswer": "push", "options": ["push", "upload", "publish", "share"], "question": "What Docker command is used to push a Docker image to a registry?"},
{"correctAnswer": "login", "options": ["login", "signin", "authenticate", "connect"], "question": "Which Docker command is used to log in to a Docker registry?"},
{"correctAnswer": "logout", "options": ["logout", "signout", "disconnect", "exit"], "question": "What Docker command is used to log out from a Docker registry?"},
{"correctAnswer": "info", "options": ["info", "status", "details", "summary"], "question": "Which Docker command is used to display system-wide information about Docker and its components?"},
{"correctAnswer": "version", "options": ["version", "v", "about", "show"], "question": "What Docker command is used to display the Docker version information?"},
{"correctAnswer": "events", "options": ["events", "log", "activity", "history"], "question": "Which Docker command is used to get real-time events from the server?"},
{"correctAnswer": "inspect", "options": ["inspect", "describe", "analyze", "details"], "question": "Which Docker command is used to get detailed information about a Docker object, such as a container or image?"},
{"correctAnswer": "system prune", "options": ["system prune", "cleanup", "clear", "remove unused"], "question": "Which Docker command is used to remove all stopped containers, unused networks, and dangling images in a single command?"},
{"correctAnswer": "search", "options": ["search", "find", "lookup", "query"], "question": "What Docker command is used to search for Docker images on Docker Hub?"},
{"correctAnswer": "cp", "options": ["cp", "copy", "move", "transfer"], "question": "Which Docker command is used to copy files/folders between a container and the local filesystem?"},
{"correctAnswer": "stats", "options": ["stats", "monitor", "live", "usage"], "question": "What Docker command is used to display a live stream of container resource usage statistics?"},
{"correctAnswer": "rename", "options": ["rename", "change", "modify", "alter"], "question": "Which Docker command is used to rename a Docker container?"},
{"correctAnswer": "pause", "options": ["pause", "freeze", "halt", "suspend"], "question": "What Docker command is used to pause the execution of processes in a running container?"},
{"correctAnswer": "unpause", "options": ["unpause", "resume", "continue", "start"], "question": "Which Docker command is used to resume the execution of processes in a paused container?"},
{"correctAnswer": "top", "options": ["top", "ps", "processes", "list"], "question": "What Docker command is used to display the running processes of a container?"},
{"correctAnswer": "attach", "options": ["attach", "connect", "join", "link"], "question": "Which Docker command is used to attach to the STDIN, STDOUT, and STDERR of a running container?"},
{"correctAnswer": "diff", "options": ["diff", "changes", "delta", "delta"], "question": "What Docker command is used to show the changes made to the filesystem of a container?"},
{"correctAnswer": "export", "options": ["export", "save", "backup", "download"], "question": "Which Docker command is used to export a container's filesystem as a tarball?"},
{"correctAnswer": "import", "options": ["import", "load", "restore", "upload"], "question": "What Docker command is used to import the contents of a tarball to create a new filesystem image?"},
{"correctAnswer": "events", "options": ["events", "log", "activity", "history"], "question": "Which Docker command is used to get real-time events from the server?"},
{"correctAnswer": "kill", "options": ["kill", "terminate", "stop", "end"], "question": "What Docker command is used to send a signal to a running container?"},
{"correctAnswer": "wait", "options": ["wait", "hold", "pause", "await"], "question": "Which Docker command is used to block until a container stops, then prints the container's exit code?"},
{"correctAnswer": "update", "options": ["update", "modify", "change", "alter"], "question": "What Docker command is used to update the configuration of one or more containers?"},
{"correctAnswer": "rollback", "options": ["rollback", "revert", "undo", "back"], "question": "Which Docker command is used to roll back to a previous version of a service?"},
{"correctAnswer": "version", "options": ["version", "v", "about", "show"], "question": "What Docker command is used to display the Docker version information?"},
{"correctAnswer": "volume ls", "options": ["volume ls", "volumes", "list volumes", "ls volumes"], "question": "Which Docker command is used to list all Docker volumes on the host?"},
{"correctAnswer": "volume inspect", "options": ["volume inspect", "inspect volume", "volume details", "volume info"], "question": "What Docker command is used to display detailed information about a Docker volume?"},
{"correctAnswer": "volume create", "options": ["volume create", "create volume", "new volume", "make volume"], "question": "Which Docker command is used to create a new Docker volume?"},
{"correctAnswer": "volume rm", "options": ["volume rm", "remove volume", "delete volume", "rm volume"], "question": "What Docker command is used to remove a Docker volume?"},
{"correctAnswer": "volume prune", "options": ["volume prune", "cleanup volumes", "clear volumes", "remove unused volumes"], "question": "Which Docker command is used to remove all unused local volumes?"},
{"correctAnswer": "network ls", "options": ["network ls", "list networks", "ls networks", "networks"], "question": "What Docker command is used to list all Docker networks on the host?"},
{"correctAnswer": "network inspect", "options": ["network inspect", "inspect network", "network details", "network info"], "question": "Which Docker command is used to display detailed information about a Docker network?"},
{"correctAnswer": "network create", "options": ["network create", "create network", "new network", "make network"], "question": "What Docker command is used to create a new Docker network?"},
{"correctAnswer": "network rm", "options": ["network rm", "remove network", "delete network", "rm network"], "question": "Which Docker command is used to remove a Docker network?"},
{"correctAnswer": "network prune", "options": ["network prune", "cleanup networks", "clear networks", "remove unused networks"], "question": "What Docker command is used to remove all unused local networks?"},
{"correctAnswer": "config ls", "options": ["config ls", "list configs", "ls configs", "configs"], "question": "Which Docker command is used to list all Docker configs on the host?"},
{"correctAnswer": "config inspect", "options": ["config inspect", "inspect config", "config details", "config info"], "question": "What Docker command is used to display detailed information about a Docker config?"},
{"correctAnswer": "config create", "options": ["config create", "create config", "new config", "make config"], "question": "Which Docker command is used to create a new Docker config?"},
{"correctAnswer": "config rm", "options": ["config rm", "remove config", "delete config", "rm config"], "question": "What Docker command is used to remove a Docker config?"},
{"correctAnswer": "config prune", "options": ["config prune", "cleanup configs", "clear configs", "remove unused configs"], "question": "Which Docker command is used to remove all unused local configs?"},
{"correctAnswer": "secret ls", "options": ["secret ls", "list secrets", "ls secrets", "secrets"], "question": "What Docker command is used to list all Docker secrets on the host?"},
{"correctAnswer": "secret inspect", "options": ["secret inspect", "inspect secret", "secret details", "secret info"], "question": "Which Docker command is used to display detailed information about a Docker secret?"},
{"correctAnswer": "secret create", "options": ["secret create", "create secret", "new secret", "make secret"], "question": "Which Docker command is used to create a new Docker secret?"},
{"correctAnswer": "secret rm", "options": ["secret rm", "remove secret", "delete secret", "rm secret"], "question": "What Docker command is used to remove a Docker secret?"},
{"correctAnswer": "secret prune", "options": ["secret prune", "cleanup secrets", "clear secrets", "remove unused secrets"], "question": "Which Docker command is used to remove all unused local secrets?"},
{"correctAnswer": "service ls", "options": ["service ls", "list services", "ls services", "services"], "question": "What Docker command is used to list all Docker services on the host?"},
{"correctAnswer": "service inspect", "options": ["service inspect", "inspect service", "service details", "service info"], "question": "Which Docker command is used to display detailed information about a Docker service?"},
{"correctAnswer": "service create", "options": ["service create", "create service", "new service", "make service"], "question": "Which Docker command is used to create a new Docker service?"},
{"correctAnswer": "service update", "options": ["service update", "update service", "modify service", "alter service"], "question": "What Docker command is used to update the configuration of a service?"},
{"correctAnswer": "service rm", "options": ["service rm", "remove service", "delete service", "rm service"], "question": "Which Docker command is used to remove a Docker service?"},
{"correctAnswer": "service scale", "options": ["service scale", "scale service", "adjust service", "resize service"], "question": "What Docker command is used to scale the number of replicas in a service?"},
{"correctAnswer": "system df", "options": ["system df", "df", "disk usage", "disk free"], "question": "Which Docker command is used to display the total disk space used by Docker and the amount of free space?"},
{"correctAnswer": "system events", "options": ["system events", "events", "system activity", "server events"], "question": "What Docker command is used to get real-time events from the server?"},
]
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
    console.error("Missing HTML elements. Make sure they exist and the script is placed after them.");
    return;
  }

  // Display the question
  questionTextElement.textContent = question.question;

  // Shuffle options for a random order
  const shuffledOptions = question.options.slice();
  shuffleArray(shuffledOptions);

  // Clear previous options
  optionsContainer.innerHTML = '';

  // Display the options
  shuffledOptions.forEach(function (option) {
    const optionButton = document.createElement('button');
    optionButton.textContent = option;
    optionButton.classList.add('option', 'p-2', 'px-5', 'm-3', 'btn', 'btn-primary', 'btn-sm');
    optionsContainer.appendChild(optionButton);
  });

  // Call the callback function after displaying options
  if (callback && typeof callback === 'function') {
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
    optionsContainer.querySelectorAll('.option').forEach(function (option) {
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

    console.log("Selected answer:", answer);
    console.log("Correct answer:", currentQuestion.correctAnswer);

    if (currentQuestion && answer === currentQuestion.correctAnswer) {
      feedbackMessageElement.textContent = "Congratulations!! Correct answer.";
      feedbackMessageElement.style.color = "green"; // Set feedback message color to green for correct answers
      score++;
      optionsContainer.querySelectorAll('.option').forEach(function (option) {
        if (option.textContent === currentQuestion.correctAnswer) {
          option.classList.add("btn-success");
        } else {
          option.classList.remove("btn-primary");
          option.classList.add("btn-light"); // Reset other options to default color
          option.disabled = true; // Disable other options after correct answer
        }
      });
    } else {
      feedbackMessageElement.textContent = "Wrong Answer! The correct answer was: " + currentQuestion.correctAnswer;
      feedbackMessageElement.style.color = "red"; // Set feedback message color to red for incorrect answers
      optionsContainer.querySelectorAll('.option').forEach(function (option) {
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
  }// Function to get the current question based on the category and index
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
    questionTextElement.textContent = "Quiz completed! Your score: " + score + " out of " + getCurrentQuestionSet().length;
    feedbackMessageElement.textContent = "";
    optionsContainer.querySelectorAll('.option').forEach(function (option) {
      option.disabled = true; // Disable all options after quiz completion
    });


  }// Function to display the "Try Again" button
function displayTryAgainButton() {
  optionsContainer.querySelectorAll('.option').forEach(function (option) {
    option.disabled = true;
  });
  tryAgainButton.style.display = "block";
}

// Function to select the category
function selectCategory(category) {
  currentCategory = category;
}

// Add event listener to handle button clicks using event delegation
optionsContainer.addEventListener('click', function (event) {
  if (event.target.classList.contains('option')) {
    checkAnswer(event.target.textContent);
  }
});

// Try Again button click event
tryAgainButton.addEventListener('click', resetGame);

// Initial setup
resetGame();

});

