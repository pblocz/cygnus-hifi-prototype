#! /usr/bin/env python
import subprocess, os, json, shutil

JSON = { "site-url": "/dsi-prototype", "export": True }


def main():
    # set new config 
    shutil.copy("config.json", "config.json.bak")
    json.dump(JSON,open("config.json","w"))

    subprocess.call(['cactus','build'])

    shutil.copy("config.json.bak","config.json")
    os.unlink("config.json.bak")

if __name__ == "__main__": main()
