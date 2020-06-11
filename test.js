const {Install, Names, Remove} = require("./TAPMAN");
Names().then((el)=>{
    Install().then(()=>{
        const inter = setInterval(()=>{
            Names().then((names)=>{
                if(names.length>el.length){
                    clearInterval(inter);
                    console.log(names);
                    Remove().then((stdout)=>{
                        console.log(stdout);
                        process.exit(0);
                    }, (err)=>{
                        console.log(err, "Imma go home");
                        process.exit(1)
                    })
                }else{
                    console.log("Interfaces not detected by system")
                }
                
            }, (err)=>{
                console.log(err, "Imma go home");
                process.exit(1)
            })
        }, 1000)
    }, (err)=>{
        console.log(err, "Imma go home");
        process.exit(1)
    })
}, (err)=>{
    console.log(err, "Imma go home");
    process.exit(1)
})
