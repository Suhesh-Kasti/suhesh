document.addEventListener("DOMContentLoaded", function() {
  // Get the required HTML elements
  const questionTextElement = document.getElementById('question-word');
  const userInputElement = document.getElementById('user-input');
  const feedbackMessageElement = document.getElementById('feedback-word');
  const confirmButton = document.getElementById('confirm-button');
  const scoreElement = document.getElementById('score-word');

// Get the code from the query parameter or the window.quizCode variable
var urlParams = new URLSearchParams(window.location.search);
var codeFromUrl = urlParams.get('code');
var wordCode = codeFromUrl || window.wordCode || "000"; // Use code from URL, window.quizCode variable, or default to "h01"

  // Define question sets
  const questionSets = {
"nmap101": [
{"correctAnswer": "nmap -sS 10.10.1.0/24", "question": "You need to scan silently the IP range of 10.10.1.0/24. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV -p80,443 example.com", "question": "You want to perform version detection on ports 80 and 443 for the website example.com. What Nmap command do you use?"},
{"correctAnswer": "nmap -sC -p- 192.168.1.100", "question": "You need to scan all ports on the host 192.168.1.100 and run default Nmap scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sU -p53,67,68 10.10.10.0/24", "question": "You want to perform a UDP scan on ports 53, 67, and 68 for the network range 10.10.10.0/24. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=vuln 192.168.10.5", "question": "You need to run Nmap scripts that check for vulnerabilities on the host 192.168.10.5. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-title 10.11.1.100", "question": "You want to grab webpage titles using Nmap NSE scripts for the host 10.11.1.100. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV -p80 --script-args=http.max-cache-size=500000 example.com", "question": "You need to increase the HTTP cache size to 500KB when running Nmap scripts on port 80 of example.com. What Nmap command do you use?"},
{"correctAnswer": "nmap -sN -Pn 192.168.5.0/24", "question": "You want to perform a TCP Null scan on the 192.168.5.0/24 network range, skipping host discovery. What Nmap command do you use?"},
{"correctAnswer": "nmap -sF -p1-100 10.10.10.10", "question": "You need to perform a TCP FIN scan on ports 1 to 100 for the host 10.10.10.10. What Nmap command do you use?"},
{"correctAnswer": "nmap -sI 10.11.12.13 192.168.2.0/24", "question": "You want to perform an idle/zombie scan on the 192.168.2.0/24 network range using the zombie host 10.11.12.13. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --version-intensity 9 192.168.100.50", "question": "You need to perform intense version detection on the host 192.168.100.50. What Nmap command do you use?"},
{"correctAnswer": "nmap -p80,443 --script=http-put --script-args='http-put.url=/test.php,http-put.file=/var/www/html/test.php'", "question": "You want to use the http-put Nmap script to upload a file to /test.php on the web server listening on ports 80 and 443. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=smb-enum-shares -p445 10.0.0.5", "question": "You need to enumerate SMB shares on the host 10.0.0.5 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=dns-brute -p53 example.com", "question": "You want to perform DNS brute-forcing on the domain example.com using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-auth-finder --script-args='http-auth-finder.path=/admin,http-auth-finder.basiconly=true'", "question": "You need to use the http-auth-finder Nmap script to find basic authentication for the /admin path. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-put --script-args='http-put.url=/test.php,http-put.file=/var/www/html/test.php' -oN output.txt", "question": "You want to save the output of the http-put Nmap script to a file named output.txt. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-headers -p80,8080 10.10.10.10", "question": "You need to grab HTTP headers from ports 80 and 8080 on the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-cookie-flags --script-args='http-cookie-flags.path=/login'", "question": "You want to check the security flags of cookies on the /login path using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-phpself-xss -p80 example.com", "question": "You need to test for PHP self-XSS vulnerabilities on the host example.com using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-sql-injection --script-args='http-sql-injection.urls=/index.php?id=1,/search.php?q=test'", "question": "You want to test for SQL injection vulnerabilities on the URLs /index.php?id=1 and /search.php?q=test using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-csrf --script-args='http-csrf.url=/login.php,http-csrf.method=POST'", "question": "You need to test for CSRF vulnerabilities on the /login.php page using the POST method with Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-open-redirect --script-args='http-open-redirect.path=/redirect.php?url=http://example.com'", "question": "You want to test for open redirect vulnerabilities on the /redirect.php path with a sample URL of http://example.com using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-backup-finder --script-args='http-backup-finder.path=/admin'", "question": "You need to search for backup files in the /admin directory using the http-backup-finder Nmap script. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-comments-displayer -p80,8080 10.10.10.10", "question": "You want to display comments in web pages from ports 80 and 8080 on the host 10.10.10.10 using the http-comments-displayer Nmap script. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-robotstxt -p80 example.com", "question": "You need to check the robots.txt file for the website example.com using the http-robotstxt Nmap script. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV -p80 -f --mtu=24 --data-length=1200 10.10.10.10", "question": "You want to fragment packets with an MTU of 24 bytes and a data length of 1200 bytes when scanning port 80 of the host 10.10.10.10. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=ssl-enum-ciphers -p443 example.com", "question": "You need to enumerate supported SSL/TLS ciphers for the website example.com using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=ssl-cert -p443 example.com", "question": "You want to retrieve the SSL/TLS certificate for the website example.com using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=smtp-commands -p25 10.10.10.10", "question": "You need to enumerate SMTP commands on port 25 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=ftp-anon -p21 10.10.10.10", "question": "You want to test for anonymous FTP access on port 21 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=smb-enum-users -p445 10.10.10.10", "question": "You need to enumerate SMB users on port 445 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=snmp-brute -p161 10.10.10.10", "question": "You want to perform a brute-force attack on the SNMP service running on port 161 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=dns-nsec-enum --script-args='dns-nsec-enum.domains=example.com'", "question": "You need to enumerate DNS records for the domain example.com using the dns-nsec-enum Nmap script. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-php-version -p80 10.10.10.10", "question": "You want to determine the PHP version running on the web server listening on port 80 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-aspnet-debug -p80 10.10.10.10", "question": "You need to check for ASP.NET debugging enabled on the web server listening on port 80 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2017-5638 -p80 10.10.10.10", "question": "You want to test for the Apache Struts2 CVE-2017-5638 vulnerability on the web server listening on port 80 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2017-8295 -p8080 10.10.10.10", "question": "You need to check for the Apache Struts2 CVE-2017-8295 vulnerability on the web server listening on port 8080 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2019-0232 -p80,8080 10.10.10.10", "question": "You want to test for the Apache Struts2 CVE-2019-0232 vulnerability on ports 80 and 8080 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2019-16759 -p8080 10.10.10.10", "question": "You need to check for the Vignette CVE-2019-16759 vulnerability on the web server listening on port 8080 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2020-24312 -p80 10.10.10.10", "question": "You want to test for the Samba CVE-2020-24312 vulnerability on the web server listening on port 80 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2021-26084 -p8080 10.10.10.10", "question": "You need to check for the Apache Struts2 CVE-2021-26084 vulnerability on the web server listening on port 8080 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2022-22965 -p80,8080 10.10.10.10", "question": "You want to test for the Apache Log4j CVE-2022-22965 vulnerability on ports 80 and 8080 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2023-21834 -p80 10.10.10.10", "question": "You need to check for the Apache HTTP Server CVE-2023-21834 vulnerability on the web server listening on port 80 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=smtp-enum-users -p25 10.10.10.10", "question": "You want to enumerate SMTP users on port 25 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=smtp-open-relay -p25 10.10.10.10", "question": "You need to test for an open SMTP relay on port 25 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=imap-capabilities -p143 10.10.10.10", "question": "You want to enumerate IMAP capabilities on port 143 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=pop3-capabilities -p110 10.10.10.10", "question": "You need to enumerate POP3 capabilities on port 110 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=ssl-heartbleed -p443 10.10.10.10", "question": "You want to test for the Heartbleed vulnerability on the SSL/TLS service running on port 443 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2019-0192 -p80,8080 10.10.10.10", "question": "You need to check for the Apache HTTP Server CVE-2019-0192 vulnerability on ports 80 and 8080 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2022-41082 -p80,8080 10.10.10.10", "question": "You want to test for the Apache Log4j CVE-2022-41082 vulnerability on ports 80 and 8080 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2023-23397 -p8080 10.10.10.10", "question": "You need to check for the Apache Struts2 CVE-2023-23397 vulnerability on the web server listening on port 8080 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=http-vuln-cve2023-23500 -p80 10.10.10.10", "question": "You want to test for the Apache HTTP Server CVE-2023-23500 vulnerability on the web server listening on port 80 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=ssh-hostkey -p22 10.10.10.10", "question": "You need to retrieve the SSH host key from port 22 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=ssh-auth-methods -p22 10.10.10.10", "question": "You want to enumerate supported SSH authentication methods on port 22 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=ssh-run.nse --script-args='ssh-run.cmd=id'", "question": "You need to execute the 'id' command on the remote SSH server using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=rdp-enum-encryption -p3389 10.10.10.10", "question": "You want to enumerate supported encryption protocols for the RDP service running on port 3389 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=telnet-encryption -p23 10.10.10.10", "question": "You need to check if the Telnet service running on port 23 of the host 10.10.10.10 supports encryption using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=snmp-hh3c-user.nse -p161 10.10.10.10", "question": "You want to enumerate SNMP users on the HH3C device running on port 161 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=snmp-ios-config -p161 10.10.10.10", "question": "You need to retrieve the configuration of the Cisco IOS device running on port 161 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"},
{"correctAnswer": "nmap -sV --script=mongodb-databases -p27017 10.10.10.10", "question": "You want to enumerate databases on the MongoDB instance running on port 27017 of the host 10.10.10.10 using Nmap NSE scripts. What Nmap command do you use?"}
    ],

    "burp101": [
{"correctAnswer": "Proxy", "question": "Which BurpSuite tool allows you to intercept and modify HTTP/HTTPS traffic?"},
{"correctAnswer": "Spider", "question": "Which BurpSuite tool is used to crawl and map the content of a website?"},
{"correctAnswer": "Scanner", "question": "Which BurpSuite tool is used to scan for web application vulnerabilities?"},
{"correctAnswer": "Intruder", "question": "Which BurpSuite tool is used to automate customized attacks and test for vulnerabilities?"},
{"correctAnswer": "Repeater", "question": "Which BurpSuite tool allows you to manually modify and resend HTTP requests?"},
{"correctAnswer": "Decoder", "question": "Which BurpSuite tool is used to encode and decode data in various formats?"},
{"correctAnswer": "Comparer", "question": "Which BurpSuite tool is used to visually compare different application responses?"},
{"correctAnswer": "Sequencer", "question": "Which BurpSuite tool is used to analyze the randomness of session tokens?"},
{"correctAnswer": "True", "question": "Can BurpSuite be used for both manual and automated web application security testing?"},
{"correctAnswer": "False", "question": "Is it ethical to use BurpSuite to test web applications without proper authorization?"},
{"correctAnswer": "Passive scanning", "question": "What type of vulnerability scanning is performed by the Spider tool in BurpSuite?"},
{"correctAnswer": "Active scanning", "question": "What type of vulnerability scanning is performed by the Scanner tool in BurpSuite?"},
{"correctAnswer": "Replay", "question": "Which attack type in the Intruder tool is used to resend the same request multiple times?"},
{"correctAnswer": "Sniper", "question": "Which attack type in the Intruder tool is used to target specific parameters with payloads?"},
{"correctAnswer": "Battering Ram", "question": "Which attack type in the Intruder tool is used to inject payloads in every possible position?"},
{"correctAnswer": "Fuzz", "question": "Which attack type in the Intruder tool is used to send semi-random payloads to identify potential vulnerabilities?"},
{"correctAnswer": "Cookies", "question": "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?"},
{"correctAnswer": "Headers", "question": "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?"},
{"correctAnswer": "Parameters", "question": "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?"},
{"correctAnswer": "Request Body", "question": "Which part of an HTTP request can be easily modified in BurpSuite's Proxy tool?"},
{"correctAnswer": "Collaborator Client", "question": "Which BurpSuite tool is used to generate a unique payload for external interaction and vulnerability detection?"},
{"correctAnswer": "Collaborator Server", "question": "Which BurpSuite component listens for interactions with the Collaborator Client payloads?"},
{"correctAnswer": "Macros", "question": "Which feature in BurpSuite allows users to record and playback a series of actions?"},
{"correctAnswer": "Extensions", "question": "Which feature in BurpSuite allows users to add third-party extensions to enhance functionality?"},
{"correctAnswer": "XML", "question": "Which data format is commonly used by BurpSuite for storing and sharing project data?"},
{"correctAnswer": "Target", "question": "Which BurpSuite feature is used to specify the target web application or website?"},
{"correctAnswer": "Site Map", "question": "Which BurpSuite feature provides a hierarchical view of the mapped content and functionality of the target web application?"},
{"correctAnswer": "Scope", "question": "Which BurpSuite feature is used to define the areas of the application that should be included or excluded from testing?"},
{"correctAnswer": "Issue Definitions", "question": "Which BurpSuite feature is used to manage and configure the types of vulnerabilities that the Scanner should look for?"},
{"correctAnswer": "BurpSuite Professional", "question": "Which edition of BurpSuite includes advanced features like the Crawler, Scanner, and Intruder tools?"}
    ],

  "docker101":[
{"correctAnswer": "docker run hello-world", "question": "How do you run the 'hello-world' Docker container?"},
{"correctAnswer": "docker pull ubuntu", "question": "How do you download the 'ubuntu' Docker image from the registry?"},
{"correctAnswer": "docker images", "question": "How do you list all the Docker images on your system?"},
{"correctAnswer": "docker rmi IMAGE_ID", "question": "How do you remove a Docker image from your system?"},
{"correctAnswer": "docker ps", "question": "How do you list all running Docker containers?"},
{"correctAnswer": "docker ps -a", "question": "How do you list all Docker containers (running and stopped)?"},
{"correctAnswer": "docker stop CONTAINER_ID", "question": "How do you stop a running Docker container?"},
{"correctAnswer": "docker rm CONTAINER_ID", "question": "How do you remove a stopped Docker container?"},
{"correctAnswer": "docker run -it ubuntu bash", "question": "How do you run the 'ubuntu' Docker container in interactive mode with a bash shell?"},
{"correctAnswer": "docker run -d nginx", "question": "How do you run the 'nginx' Docker container in detached mode?"},
{"correctAnswer": "docker exec -it CONTAINER_ID bash", "question": "How do you access the bash shell of a running Docker container?"},
{"correctAnswer": "docker logs CONTAINER_ID", "question": "How do you view the logs of a Docker container?"},
{"correctAnswer": "docker build -t my-app .", "question": "How do you build a Docker image from a Dockerfile in the current directory and tag it as 'my-app'?"},
{"correctAnswer": "docker run -p 8080:80 nginx", "question": "How do you run the 'nginx' Docker container and map port 8080 on the host to port 80 in the container?"},
{"correctAnswer": "docker run -v /host/path:/container/path nginx", "question": "How do you run the 'nginx' Docker container and mount a host directory to a directory in the container?"},
{"correctAnswer": "docker network create my-network", "question": "How do you create a new Docker network named 'my-network'?"},
{"correctAnswer": "docker run --name my-container -d nginx", "question": "How do you run the 'nginx' Docker container in detached mode and name it 'my-container'?"},
{"correctAnswer": "docker inspect CONTAINER_ID", "question": "How do you inspect the details of a Docker container?"},
{"correctAnswer": "docker cp host_path container_id:container_path", "question": "How do you copy a file from the host to a Docker container?"},
{"correctAnswer": "docker cp container_id:container_path host_path", "question": "How do you copy a file from a Docker container to the host?"},
{"correctAnswer": "docker commit CONTAINER_ID my-image", "question": "How do you create a new Docker image from a running container and name it 'my-image'?"},
{"correctAnswer": "docker push my-registry.com/my-image:tag", "question": "How do you push a Docker image to a remote registry?"},
{"correctAnswer": "docker run --env VAR_NAME=value nginx", "question": "How do you set an environment variable when running a Docker container?"},
{"correctAnswer": "docker run --name my-container -d --restart=always nginx", "question": "How do you run a Docker container named 'my-container' in detached mode and configure it to always restart?"},
{"correctAnswer": "docker run --cpus=2 --memory=1g nginx", "question": "How do you run the 'nginx' Docker container and limit its CPU and memory resources?"},
{"correctAnswer": "docker volume create my-volume", "question": "How do you create a new Docker volume named 'my-volume'?"},
{"correctAnswer": "docker run -v my-volume:/container/path nginx", "question": "How do you run the 'nginx' Docker container and mount the 'my-volume' volume to a directory in the container?"},
{"correctAnswer": "docker-compose up", "question": "How do you start all services defined in a Docker Compose file?"},
{"correctAnswer": "docker-compose down", "question": "How do you stop and remove all containers and networks defined in a Docker Compose file?"},
{"correctAnswer": "docker-compose up -d", "question": "How do you start all services defined in a Docker Compose file in detached mode?"},
{"correctAnswer": "docker-compose logs SERVICE_NAME", "question": "How do you view the logs of a specific service defined in a Docker Compose file?"},
{"correctAnswer": "docker-compose build", "question": "How do you build or rebuild the services defined in a Docker Compose file?"},
{"correctAnswer": "docker-compose run SERVICE_NAME command", "question": "How do you run a one-off command for a specific service defined in a Docker Compose file?"},
{"correctAnswer": "docker run --name my-container -d --network my-network nginx", "question": "How do you run the 'nginx' Docker container in detached mode and attach it to the 'my-network' network?"},
{"correctAnswer": "docker network connect my-network my-container", "question": "How do you connect an existing Docker container named 'my-container' to the 'my-network' network?"},
{"correctAnswer": "docker run --cap-add NET_ADMIN nginx", "question": "How do you run the 'nginx' Docker container with additional capabilities (e.g., NET_ADMIN)?"},
{"correctAnswer": "docker run --security-opt seccomp=unconfined nginx", "question": "How do you run the 'nginx' Docker container with the seccomp security profile unconfined?"},
{"correctAnswer": "docker run --privileged nginx", "question": "How do you run the 'nginx' Docker container in privileged mode?"},
{"correctAnswer": "docker run --user user_id nginx", "question": "How do you run the 'nginx' Docker container as a specific user (e.g., user_id)?"},
{"correctAnswer": "docker stats", "question": "How do you view the resource usage statistics for running Docker containers?"},
{"correctAnswer": "docker system prune", "question": "How do you remove all unused Docker objects (containers, networks, images, and volumes)?"},
{"correctAnswer": "docker system df", "question": "How do you view the disk usage of Docker objects (containers, images, volumes, etc.)?"},
{"correctAnswer": "docker run --cpuset-cpus=0,1 nginx", "question": "How do you run the 'nginx' Docker container and limit it to specific CPU cores?"},
{"correctAnswer": "docker run --blkio-weight 500 nginx", "question": "How do you run the 'nginx' Docker container and set its block I/O weight relative to other containers?"},
{"correctAnswer": "docker run --device=/dev/tty0:/dev/tty0 nginx", "question": "How do you run the 'nginx' Docker container and map a host device to a device in the container?"},
{"correctAnswer": "docker run --dns=8.8.8.8 nginx", "question": "How do you run the 'nginx' Docker container and set a custom DNS server?"},
{"correctAnswer": "docker run --link container_name:alias nginx", "question": "How do you run the 'nginx' Docker container and link it to another container with an alias?"},
{"correctAnswer": "docker run --net=host nginx", "question": "How do you run the 'nginx' Docker container and use the host's network stack?"},
{"correctAnswer": "docker run --pid=host nginx", "question": "How do you run the 'nginx' Docker container and use the host's PID namespace?"},
{"correctAnswer": "docker run --ipc=host nginx", "question": "How do you run the 'nginx' Docker container and use the host's IPC namespace?"},
{"correctAnswer": "docker run --uts=host nginx", "question": "How do you run the 'nginx' Docker container and use the host's UTS namespace?"},
{"correctAnswer": "docker run --read-only nginx", "question": "How do you run the 'nginx' Docker container with a read-only file system?"},
{"correctAnswer": "docker run --tmpfs /tmp nginx", "question": "How do you run the 'nginx' Docker container and mount a tmpfs (temporary file system) at /tmp?"},
{"correctAnswer": "docker run --add-host=example.com:1.2.3.4 nginx", "question": "How do you run the 'nginx' Docker container and add a custom host-to-IP mapping?"},
{"correctAnswer": "docker run --health-cmd='curl http://localhost' nginx", "question": "How do you run the 'nginx' Docker container and set a custom health check command?"},
{"correctAnswer": "docker run --health-interval=5s nginx", "question": "How do you run the 'nginx' Docker container and set the interval for running the health check command?"},
{"correctAnswer": "docker run --health-retries=3 nginx", "question": "How do you run the 'nginx' Docker container and set the number of retries for the health check command?"},
{"correctAnswer": "docker run --health-start-period=10s nginx", "question": "How do you run the 'nginx' Docker container and set the start period for the health check command?"},
{"correctAnswer": "docker run --health-timeout=5s nginx", "question": "How do you run the 'nginx' Docker container and set the timeout for the health check command?"}

  ]
  };

  // Game state variables
  let currentQuestionIndex = 0;
  let currentCategory = wordCode; // You can change this to switch categories
  let score = 0;
  let totalQuestions = 0;

  // Function to display a question
  function displayQuestion(question) {
    if (!questionTextElement || !userInputElement) {
      console.error("Missing HTML elements. Make sure they exist and the script is placed after them.");
      return;
    }

    // Display the question
    questionTextElement.textContent = question.question;

    // Clear previous user input
    userInputElement.value = "";
  }


function checkAnswer() {
  // Check if the answer has already been processed
  if (confirmButton.disabled) {
    return;
  }

  // Disable the button to prevent multiple clicks
  confirmButton.disabled = true;

  const currentQuestion = getCurrentQuestion();
  const userAnswer = userInputElement.value.trim().toLowerCase(); // Remove leading/trailing spaces from user input

  if (userAnswer === currentQuestion.correctAnswer.toLowerCase()) {
    feedbackMessageElement.textContent = "Congratulations!! Correct answer.";
    feedbackMessageElement.style.color = "green"; // Set feedback message color to green for correct answers
    score++;
  } else {
    feedbackMessageElement.textContent = "Wrong Answer! The correct answer was: " + currentQuestion.correctAnswer;
    feedbackMessageElement.style.color = "red"; // Set feedback message color to red for incorrect answers
  }

  currentQuestionIndex++;
  updateScore();

  // Check if all questions are answered
  if (currentQuestionIndex < getCurrentQuestionSet().length) {
    // Enable the button for the next question after a short delay
    setTimeout(() => {
      confirmButton.disabled = false;
    }, 100);
    displayNextQuestion();
  } else {
    // All questions answered, display final score
    displayFinalScore();
  }
}


// Separate function to handle Enter key press
function handleEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent the default form submission behavior
    checkAnswer();
  }
}

// Attach Enter key press event listener
userInputElement.addEventListener('keydown', handleEnterKey);


  // Function to update the score display
  function updateScore() {
    scoreElement.textContent = `Correct: ${score} | Wrong: ${currentQuestionIndex - score}`;
  }

  // Function to display the final score
  function displayFinalScore() {
    const totalQuestions = getCurrentQuestionSet().length;
    feedbackMessageElement.textContent = `Final Score: Correct: ${score} | Wrong: ${totalQuestions - score}`;
  }

   // Function to get the current question based on the category and index
  function getCurrentQuestion() {
    const questionSet = questionSets[currentCategory];

    if (currentQuestionIndex < questionSet.length) {
      return questionSet[currentQuestionIndex];
    } else {
      // All questions have been answered, return null
      return null;
    }
  }

  // Function to get the current question set based on the category
  function getCurrentQuestionSet() {
    const questionSet = questionSets[currentCategory] || [];
    return questionSet;
  }

function displayNextQuestion() {
  const currentQuestionSet = getCurrentQuestionSet();

  if (currentQuestionSet.length === 0) {
    // No questions defined for this category
    feedbackMessageElement.textContent = "There are no questions defined for this category.";
    userInputElement.disabled = true;
    confirmButton.disabled = true;
  } else {
    const currentQuestion = getCurrentQuestion();

    if (currentQuestion) {
      displayQuestion(currentQuestion);
    } else {
      // No more questions, handle this case
      feedbackMessageElement.textContent = "You have completed all the questions for this category.";
      userInputElement.disabled = true;
      confirmButton.disabled = true;
    }
  }
}
  // Function to reset the game
  function resetGame() {
    currentQuestionIndex = 0;
    score = 0;
    totalQuestions = getCurrentQuestionSet().length;
    updateScore();
    displayNextQuestion();
  }

  // Add event listener to handle button click
  confirmButton.addEventListener('click', checkAnswer);


  // Initial setup
  totalQuestions = getCurrentQuestionSet().length;
  displayNextQuestion();
});
