import jwt from 'jsonwebtoken'

export const verifyToken = (req,res,next)=>{
   const token = req.cookies.accessToken
   console.log(req.cookies);
   
   if(!token){
    return res.status(401).json({success:false,message:'Not an Authorize User',token:token});
   }

   jwt.verify(token,process.env.JWT_SECRET_KEY,(err,user)=>{
    if(err){
        return res.status(401).json({success:false,message:'Invalid Token'});
    }
    req.user=user;
    next();
   })
}

export const verifyUser = (req,res,next)=>{
    verifyToken(req,res,next,()=>{
       if(req.user.id===req.params.id || req.user.role==='admin'){
        next();
       }
       else{
         res.status(401).json({success:false,message:'You are not authenticated!'});
       }
    })
}
export const verifyAdmin= (req,res,next)=>{
    verifyToken(req,res,next,()=>{
       if(req.user.role==='admin'){
        next();
       }
       else{
         res.status(401).json({success:false,message:'You are not authorize'});
       }
    })
}