---
title: 'Home Server'
description: 'A Home Serve to run local LLMs, an AI harness and some other services. Maybe some videogame serves.'
tags: ['Hardware', 'AI', 'Self-Host', ]
start date: '2026-06-25'
end date: '-'
status: 'live'
relatedTag: 'project-home-server'
---
## Why do I do this to myself?

I've wanted to self host stuff for quite some time. It's one of the reasons I started this website. I want to actually own stuff, set it up, know how it works, figure out what's wrong with it and fix it.

At the same time, it feels like a lot of work. I guess because it is. Some say that's part of the fun. I call those of us that do "crazy", or "dreamers" depending on the day.

Ever since learning about AI Harnesses a few months ago, I've been interested in them. They seem like a really powerfull tool. The more I thought about it, the more sense it made to host one in a 24/7 server that I could access any time from any of my machines (PC, laptop or raspberry).

As a side, not so side, benefit: I can host some video game servers to play with friends 😀

I initially thought about hosting this in an old RaspberryPi 3B+ or in my current mini-server RaspberryPi 4B. But this would be running very tight and with not much room for anything else. Worse yet, it would probably trottle my home network because of the Pihole's DNS running on it. We really don't want that.

## Now, what to do... What to do?

I've considered buying a mini-pc and going from there, but the price really put me off. I don't really have 400-700€ spare right now for a "silly little project" that I would probably not take full advantage of.

Fast forward to now, and I've got some really great spare PC parts lying around from my recent desktop upgrade plus some other older PCs.

So, right now all I'm missing is a case, a CPU cooler and some storage. Maybe some more RAM. From what I've researched, I'm looking at maybe 100-200€ investment for a beefy server that will take care of everything I want and then some!

## The Setup

After a lot (and I mean **A LOT**) of back-and-forward with Claude discussing possible options for case, cpu cooler and motherboard (for mATX or mITX builds), I've come down to two options:
 - ATX build: I only get a case
 - mATX or mITX: I get a case and a motherboard

Other than that, I only need some storage, a cpu cooler and maybe a RAM upgrade.

Here's what I'm planning right now for the server:

| Component   | Planned                               | Status                                                              |
| ----------- | ------------------------------------- | ------------------------------------------------------------------- |
| Motherboard | MSI MPG B550 Gaming Plus (AM4)        | ✅ Spare part - Might look for mITX                                 |
| CPU         | AMD Ryzen 5 5600X                     | ✅ Spare part                                                       |
| CPU Cooler  | Thermalright Peerless Assassin 120 SE | ✅ Got it. Waiting case for install |
| GPU         | MSI Radeon RX 580 Armor 8GB OC        | ✅ Spare part                                                       |
| RAM         | G.Skill Aegis DDR4-3200 CL16 2×8GB    | ✅ Spare part - ~~Might upgrade to 16GB~~                               |
| PSU         | OCZ700MXSP 700W                       | ✅ Spare part                                                       |
| Storage     | NVMe for OS + services (256GB)        | ✅ I have a "spare" 512Gb M.2 NVMe in my Desktop that I freed up |
| Case        | CoolerMaster Q500L                    | ✅ Bought 2nd hand, mostly new                     |
| OS          | Ubuntu Server 26.04.1 LTS            | ✅ Installed and running with a ZFS root                                         |

This is an already very beefy setup, with minimal investment. A very big step-up from a mini computer in terms of specs. 

Not wanting to spend much on this project, I ended up going with the parts I had and just got the smallest ATX case I could find.

I would love to upgrade this to 16Gb RAM but *have you seen memory prices lately?!* It's insane. Maybe in a couple years or so.

## Current State
The server is assembled and running! So far, this is what's done:
- Installed Ubuntu Server 26.04.1 (autoinstall, ZFS root on the SN750); SSH key auth, static IP via DHCP reservation
- First `apt upgrade` after a pre-upgrade snapshot
- Short power-button press ignored via logind drop-in to prevent misclick shutdowns
- `presnap` script for recursive root + boot snapshots
- Fixed hidden journal (flush waits for `zfs-mount`)
- Rehearsed offline rollback from Ventoy live ISO ✔
- Built headless recovery: dracut-sshd in initramfs + `recovery-reboot` (kexec) + `zrollback`; full SSH rollback rehearsed ✔
- Wrote the recovery runbook
- Configured Claude Code to run auto in a safe(ish) mode
- llama.cpp (Vulkan) as localhost systemd service; Qwen3-4B-Instruct-2507 + Qwen3-8B

## What's Next
 - Repaste GPU and maybe get better case fans
 - Finish configuring Hermes to run both llama models and Claude Code
 - Install Tailscale for remote access
 - ZFS ARC cap so the server doesn't run OOM
 - ZFS `copies=2` so there's some sort of fallback for a bad sector