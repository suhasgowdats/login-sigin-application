const bcrypt=require('bcryptjs')
const saltRound=10

const hashedPassword= async(pws)=>{
    let salt= await bcrypt.genSalt(saltRound);
    console.log("second")
    let hashpwd=await bcrypt.hash(pws,salt)
    console.log("third")
    return hashpwd
}

const pwsCompair= async(pws,hash)=>{
    let res=await bcrypt.compare(pws,hash);
    return res
}

module.exports={
    hashedPassword,pwsCompair
}