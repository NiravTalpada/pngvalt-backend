const router = require("express").Router();
const RazorPay = require("razorpay");
const crypto = require("crypto");
const { error } = require("console");
// const { default: orders } = require("razorpay/dist/resources/orders");

router.post("/order", async(req, res) => {
    try{
        const instance = new RazorPay({
            key_id : "rzp_test_KuBIpixxRAhdkY",
            key_secret : "XDwB3qa42g76tFLxTLeDcloW"
        })

        let TotalAmount = req.body.map(a => a.amount).reduce(function(a, b)
        {
            return a + b;
        });
        const options = {
            amount : TotalAmount,
            currency : "INR",
            receipt : crypto.randomBytes(10).toString("hex"),
        }

        instance.orders.create(options, (error, order) => {
            if(error){
                return res.status(500).json({ message: "Something Went Wrong!"})
            }
            res.status(200).json({ data: order});
            
        })
        
    } catch (error){
        res.status(500).json({message : "Internal Server Error!"})
    }

})

router.post("/verify", async(req, res) => {
    try {
        const {
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature 
        } = req.body;
        const sign = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSign = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

        if(razorpaySignature === expectedSign){
            return res.status(200).json({ message : "Payment verified successfully"})
        }else { 
            return res.status(400).json({ message : "Invalid signature sent!"})
        }
    } catch (error){
        console.log(error);
        res.status(500).json({message: "Internal Server Error!"})
    }
})
module.exports = router