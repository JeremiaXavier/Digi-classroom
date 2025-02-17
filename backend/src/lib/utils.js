import jwt from "jsonwebtoken";


export const generateToken= (userId,res)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d",
    });

    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,/* 7 days in milliseconds */
        httpOnly:true,/* cross site scripting attack prevention */
        sameSite:"strict",/* csrf attack prevention */
        secure:process.env.NODE_ENV !== "development",/* true for https */
    })

    return token;
}

