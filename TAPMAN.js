const {exec} = require("child_process")
const {readFile, writeFile, exists, unlink} = require("fs");
const Names = ()=>new Promise((res, rej)=>{
    exec("wmic nic get Name, MACAddress", (err, stdout, stderr)=>{
    if(err){
        rej(err)
    }else{
        const interfaces = stdout.split("\r\n").filter((item)=>item.includes("TAP-Win32")).map((item)=>item.split(" ").filter((item)=>item.length>0)[1]).map((address)=>{
            while(address.includes(":")){
                address = address.replace(":", "-");
            }
            return address
        })
        exec("ipconfig /all", (err, stdout)=>{
            if(err){
               rej(err)
            }else{
                const adapters = stdout.split("\r\n\r\n");
            const eligible = [];
            adapters.forEach((adapter, i)=>{
                interfaces.forEach((address)=>{
                    if(adapter.includes(address)){
                        eligible.push(adapters[i-1])
                    }
                })
            })
            res(eligible.map((item)=>item.replace("Ethernet-Adapter", "").replace(":", "").trim()))
            }
            
        })
    }
})
})
const execute = (filename, finishedmark)=>new Promise((res, rej)=>{
    exec(`"${__dirname}/${filename}"`, (err, stdout, stderr)=>{
        let resolved = false;
        setTimeout(()=>{
            if(!resolved){
                rej("this is taking too long")
            }
        }, 30000)
        if(err){
            rej(err)
        }else{
            const inter = setInterval(()=>{
                exists(__dirname+"/"+finishedmark, (ex)=>{
                    if(ex){
                        clearInterval(inter);
                        resolved=true;
                        res(stdout)
                    }
                })
            }, 200)
        }
    })
})
const Install = ()=>new Promise((res, rej)=>{
    const finishedmark = "installfin.txt"
    const itext = `
"${__dirname}/driver/tapinstall.exe" install "${__dirname}/driver/OemWin2k.inf" tap0901`
    writeAdmin(itext, "tapinstall.bat", finishedmark).then(()=>{
        execute("tapinstall.bat", finishedmark).then((stdout)=>{
            unlink(__dirname+"/"+finishedmark, (err)=>{
                if(err){
                    rej(err)
                }else{
                    res(stdout)
                }
            });
        }, rej)
    }, rej)
})
const writeAdmin = (toAdmin, fileName, finishedmark)=>new Promise((res, rej)=>{
    exists(__dirname+"/"+fileName, (ex)=>{
        if(!ex){
            readFile(__dirname+"/requestadmin", (err, data)=>{
                if(err){
                    rej(err);
                }else{
                    writeFile(__dirname+"/"+fileName, data.toString()+toAdmin+`
echo done > "${__dirname}/${finishedmark}"`, (err)=>{
                        if(err){
                            rej(err)
                        }else{
                            res()
                        }
                    })
                }
            })
        }else{
            res()
        }
    })
})
const Remove = ()=>new Promise((res, rej)=>{
    const finishedmark = "taprem.txt";
    const toAdmin = `
    "${__dirname}/driver/tapinstall.exe" remove tap0901`;
    writeAdmin(toAdmin, "tapremove.bat", finishedmark).then(()=>{
        execute("tapremove.bat", finishedmark).then((stdout)=>{
            unlink(__dirname+"/"+finishedmark, (err)=>{
                if(err){
                    rej(err)
                }else{
                    res(stdout)
                }
            })
        }, rej)
    }, rej)
})
module.exports = {
    Names,
    Install,
    Remove
}