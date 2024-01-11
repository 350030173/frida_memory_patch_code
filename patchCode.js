
/**

内存指令替换，支持ARM 32位，64位

*/

/**
 * 将给定的十六进制字符串进行倒序处理，并转换为对应的十进制数值
 * 
 * 例：C0 03 5F D6 倒序是 D6 5F 03 C0，再转为10进制是3596551104
 * @param {*} hexString 
 * @returns 
 */
function reverseHex(hexString) 
{
	var reversedHexString = hexString.split(' ').reverse().join('');
	
    const decimalValue = parseInt(reversedHexString, 16);
	
    return decimalValue;
}

/**
 * args[0]: 目标so
 * args[1]: 目标地址
 * args[2]，args[2]，args[x]: 改变的16进制码,可以有多个
 * 
 * 例:patchCode("libil2cpp.so",0x601560,"01 00 a0 e3","1E FF 2F E1")
 * 
 * @param  {...any} args 
 */
function patchCode(...args)
{
    if (args.length > 2)
    {
        console.log("Process.arch：" + Process.arch);
		//args[0] = "libil2cpp.so";//改成固定的，在控制台输入的的时候不用每次都输入so名称
        var nativePointer = Module.getBaseAddress(args[0]).add(args[1]);
        Memory.patchCode(nativePointer, 4, function (code) 
        {
            console.log("before======================");
            console.log(hexdump(nativePointer, { length: 0x50 }));

            if (Process.arch == "arm64")
            {
                var arm64Wt = new Arm64Writer(code, { pc: nativePointer });
                for (var i = 2; i < args.length; i++) 
                {
                    arm64Wt.putInstruction(reverseHex(args[i]))
                }
                arm64Wt.flush();
            } else
            {
                var armWt = new ArmWriter(code, { pc: nativePointer });
                for (var i = 2; i < args.length; i++) 
                {
                    armWt.putInstruction(reverseHex(args[i]))
                }
                armWt.flush();
            }

            console.log("\nafter======================");
            console.log(hexdump(nativePointer, { length: 0x50 }));
        });
    } else
    {
        console.log("\n参数不够。。。");
    }


}

function main()
{
    patchCode("libil2cpp.so", 0x14a126c, "20 00 80 52", "C0 03 5F D6");
}

setImmediate(main);
