---
title: "Update software on F5 BigIP"
description: "A checklist for updating firmware in F5 BigIP"
date: 2024-12-25T12:10:00+05:45
checklist_categories: ["F5"]
checklist_tags: ["bigip", "firmware update", "version"]
draft: false
weight: 1
---

- [ ] Import the iso image on the F5 appliance and start the import process on the drive.
> Importing the iso just imports the iso to bigip and doesn't do anything else. Performing it first can save time.
- [ ] Download the UCS files and save it locally.
- [ ] Take the note of the license key details. *(You don’t need to input add-on license key on the registration)*
- [ ] Make sure the ISO import is completed and then re-activate the license key (takes almost 2-3 minutes)
 
On TMSH:
- [ ] Verify the service check date on the F5
	```bash
    tmsh show /sys license | grep "Service"
    ``` 
- [ ] Look all the state is ready for software upgrade
	```bash
	tmsh show /sys mcp-state
    ```
- [ ] To verify F5 is ready for software without any interruption
    ```bash
    load sys config verify
    ```	 
- [ ] To display all the required and dameon are running in F5
	```bash
    tmsh show sys service all
    ```
 
Once all the verification has been completed:
- [ ] Install the imported ISO in the inactive partition 
> Installing might take a bit of time. Since the installation is taking place in the inactive partition it should not affect traffic.
- [ ] Change the boot location to the upgraded partition
> During the changing of the software upgrade, it’s normal to receive – Internal Server Error when it takes too long on the idle software upgrade page. (Takes around 15-20 minutes)
For few minutes, the state of the instance will be OFFLINE even when it’s login. It’s normal.

- [ ] NAT back the traffic to the VIP of the F5 BIG-IP and look over the event logs whether request is coming through F5 or not.
