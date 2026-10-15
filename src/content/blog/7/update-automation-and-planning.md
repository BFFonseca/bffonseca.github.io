---
title: 'Update, Automation and Planning'
description: "🔧 Big update on what's been going on and where we're headed next"
date: '2026-10-12'
tags: ['update', 'milestone', 'hardware', 'project-home-server', 'project-psu-repair']
draft: false
---

## Update on things

Switch review project finished, got a new camera and lens, some vacations, lots of photos taken, website UI updates, PSU soldered and exploded, Linux server assembled and working. 

TL;DR: A lot's been happenning.

Let's me break it down.

### Switch Review
The [switch review project](/projects/project-switch-review) is complete. That's one thing closed and out of my mind. I'm not going to expand much on that. You can check the project page and the other blog posts about it if you want.

### Photography 
*I'm going to nerd out a bit about photography here, so you can skip this part if you're not interested* 🙃

I've been into photography for 7+ years now, I even started an [Instagram page](https://www.instagram.com/bf.focus) to share some photos. 
Back then I bought a Canon EOS 750D. It's a good camera, don't get me wrong. But the... antique (?) aspect of it made me loose interest a bit. It's heavy, big and slow. I decided a few years after starting that I wanted a mirrorless camera. At the time, those were pretty expensive and didn't compare in quality to a DSLR so I held off on buying one. Over the years, my interest in photography started to fade, specially due to dreading having to take the heavy, bulky camera with me.

Then something happened at the start of the summer: A friend wanted to buy a mirrorless and asked for an opinion.
That was the point of no return for me. I started researching mirrorless cameras, which ones were the best bang for the buck, which were the best for photography, for video, full frame vs crop, newer sensors or technologies with each iteration... 

<p align="center">
  <img src="https://raw.githubusercontent.com/BFFonseca/bffonseca.github.io/refs/heads/main/src/content/blog/7/media/alice-rabbithole.gif" alt="Alice going down the rabbit hole" />
</p>

I got sucked into the rabbithole of spec comparison and price checking everything, both new and 2nd hand cameras and lenses.
Meanwhile my friend had already decided and bought a Sony a6400 kit with 2 lenses. Really good for a beginner to take some casual photos while roaming around on the weekends.

I, on the other hand, was stuck on versus.com and Youtube comparing 7 different cameras and their lenses! After a lot of spec comparison and budget considerations I ended up deciding I **needed** (*fine*, wanted 🙄) a Sony a6700. With a Sigma 18-50 f/2.8 because the kit lens isn't enough for what I'm used to anymore.

For context, the Canon has a 50mm f/1.8 prime living on it. I've probably swapped it out for the kit lens 2 or 3 times since I got it. I'm so used to that amazing bohke and low light capability of the f/1.8 that the Sony 16-50 f/3.5-5.6 wasn't really cutting it for me. And I was already aware of tzhis even before buying the Sony camera. So one more thing I was looking for was a second-hand Sigma 18-50 f/2.8 lens.

After months of searching for used a6700 and the 18-50, I gave up. All the used were either priced very close to a new one, or people just didn't answer. I ended up getting a new Sony a6700 with a 20% discount in a national store (good for warranty) and a new Sigma 18-50 in a website that sells from the Asia market, since the warranty here wouldn't matter as much as for the body.

All this to say: This whole thing took some serious headspace for 2 or 3 months. Between constantly checking 2nd-hand markets to deciding what I actually was going to buy, it took a tool before I noticed. It was very relieving once I finally had the camera in hands and could take photos of the small vacation we took in September.

### Website
So the website got a few small upgrades meanwhile. Resized some fonts, updated some colors, fixed some broken links. The usual maintenance and some small UI updates really.

### PSU Repair
Yeah... so... It kinda exploded 😀
<p align="center">
  <img src="https://raw.githubusercontent.com/BFFonseca/bffonseca.github.io/refs/heads/main/src/content/blog/7/media/psu-short.gif" alt="PSU shorts and sparks fly" />
</p>

That scared the shit out of me. *It was loud as hell!*
You can't hear it, but if you've experienced this before you know what I'm talking about. 

I soldered a track that was seemingly melted/burned due to over time exposure to heat. It looked like it was supposed to be shorted, so I did. Well... You probably guessed it by now, it shouldn't have been shorted. In fact I'm starting to believe it either shouldn't be shorted or something else is causing a very high current there.
<p align="center">
  <img src="https://raw.githubusercontent.com/BFFonseca/bffonseca.github.io/refs/heads/main/src/content/blog/7/media/psu-short-after-repair.png" alt="PSU shorted circuit" />
</p>

For now I'm putting this on hold since I don't really need that PSU and I've remembered why I don't like AC and high voltages 😌

### Linux Server
A few weeks ago I noticed I had an almost complete computer laying around in parts. Why not put them to use and learn a few things along the way?
I made a parts list and was only missing a couple: a CPU cooler and a (small) case. I got the CPU cooler quickly from amazon, it was fairly cheap. The case was a bit harder. I was looking for a small ATX case. I know that sounds a bit counter-intuitive, but believe me: there are some small ATX cases out there.

My biggest contenders were the Cooler Master Q500L and the Jonsbo D41. I was very inclined towards the Jonsbo case. *Specially* once I learned it had a optional screen plate accessory thing in the front. It's an 8" TFT LCD that sits in the front panel of the case. I immediatelly started imagining the possibilities of having a server dashboard with the HW status, the containers running, the services and anything else that could be usefull at a glance on a headless server. Though... I guess that if it had this display it wouldn't be headless anymore? 🤔. Anyway, it would be amazing. Except... There's no stock, there's none in the 2nd-hand markets and it's an old case. The stock that exists is very overpriced.

My goal with this project was to re-use the parts I have and keep it on a very thight budget (specially after buying the camera and lens). So I started looking at the Cooler Master Q500L and fortunatelly I found one second-hand almost new for cheap. So I bought it and received it maybe a week later.

I've since built the Server, installed Ubuntu Server 26.04.1 LTS on ZFS so I can roll back bad updates and got Claude Code and llama.cpp working to help me manage the server. I also asked Claude to build a pretty dashboard that I can access on my LAN through a web-browser 😁
<p align="center">
  <img src="https://raw.githubusercontent.com/BFFonseca/bffonseca.github.io/refs/heads/main/src/content/blog/7/media/server-dashboard.png" alt="Web Dashboard for the Ubuntu Server" />
</p>


### Small backend update with big implications
While I was writting this, I got tired of how long npm took to launch the local server I use to preview the website before pushing changes to main.

I noticed the npm server took >2 minutes to launch on WSL. So I asked Claude if I could run in on Power Shell, since I'm on Windows when I write content for the website. While we're at it, I want a single command and an executable file that will launch the website locally through Power Shell, for efficiency.

I also learned that I could have had hot-reload all this time. So far, every time I made a change I had to Ctrl+C on the WSL session running the npm server and restart it. This was very annoying. Specially when I made small changes and wanted to compare the old vs the new.

Long story short: Update to npm, node.js, dependencies, bla bla bla, technical stuff (check [github](https://github.com/BFFonseca/bffonseca.github.io/pulls?q=is%3Apr+state%3Aclosed+10+11) if you want nerd specifics) and then creating a PS script to run this locally with hot-reloads that launches the server in seconds instead of taking minutes. Big upgrade for me, nothing new for you. 

And now it's 14:40 and I haven't had lunch because I've been doing this seemingly invisible update that will make my workflow better for the future. And here I thought *"I'll just write a blog post because I haven't in a while with updates and then go have lunch."* 

This is the part where I wish there was a pill that would feed me for 4 more hours so I didn't lose the Flow on what I'm doing. I'm just going to have lunch before I try the PS script. I really hope it works 1st try (yeah, right!) so I can finally finish writting this post...

*PS: This is at the end of the post, but I did the changes and wrote this before even finishing the Photography section, because the npm server was taking too long 😅*


## Automation
Now I want to start automating some processes with some Hermes agents. I'm not 100% on what first, but I want to mess around with AI agents living inside this machine and coming up with stuff to do on their own. Mostly maintenance but I'm thinking I can ask one of the agents to just come up with cool stuff I might like. I don't know yet.

For now I need to get hermes running with llama and claude. Then I might try to get some video-game servers up and running to see how this machine performs. I also have an idea to server videos to my TV via jelly fin, but it's a bit convoluted and for a very specific reason. I'll post about it if I end up doing it in the future.

## Planning
### Heat
I ran a few stress tests on llama yesterday and the GPU went up to 86/87ºC with fans at max speed. That's hot, I could feel it since the Server is sitting right next to my legs under the desk. 

For now my plan is to repaste the GPU and stress test it again. Some people reported 10-15ºC cooler temps after repasting, so that might be enough. 

If that's not enough, I'll consider buying a couple of good fans, since the only ones I have are the stock and a random 9mm fan I had lying around. Neither of them with PWM. That combined with this case's infamous bad air flow, really doesn't refresh the GPU enough.

### Website updates
I've been very inconsistent on blog posts and project updates so far. I want to change that.
My goal right now is to do at least a blog post a week and update the projects at least twice a month.

Right now the projects are very out of date and I just spent a whole day writting an update post that almost felt like writting documentation on an old project that you haven't worked on for 2 months 😓

Anyway, that's it for now! I'm uploading this and taking a very deserved break! Maybe I'll just update the [Server Project](/projects/project-home-server)...