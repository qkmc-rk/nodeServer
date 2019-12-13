//定义工具模块
var utils = {
    createReturnData:function(status,code,data,msg){
        var obj = {
            "status":status,//类似http状态码
            "code":code,//1表示成功，0表示失败
            "data":data,//返回的数据，0返回为空
            "msg":msg//返回提示信息
        }
        return JSON.stringify(obj);
    }
}
module.exports=exports=utils;