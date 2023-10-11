
/**

内存指令替换，支持32位，64位

*/

/**
 * 将给定的十六进制字符串进行倒序处理，并转换为对应的十进制数值
 * 
 * 例：C0035FD6 倒序是 D6 5F 03 C0，再转为10进制是3596551104
 * @param {*} hexString 
 * @returns 
 */
function reverseHex(hexString) 
{
    // 将十六进制字符串按两个字符一组切割，并倒序排列
    const reversedHexChars = hexString.match(/.{1,2}/g).reverse();

    // 将倒序后的十六进制字符串合并为一个新的字符串
    const reversedHexString = reversedHexChars.join('');

    // 将倒序后的十六进制字符串转换为对应的十进制数值
    const decimalValue = parseInt(reversedHexString, 16);

    return decimalValue;
}

/**
 * args[0]: 目标so
 * args[1]: 目标地址
 * args[2]，args[2]，args[x]: 改变的16进制码,可以有多个
 * 
 * 例:patchCode("libil2cpp.so",0x601560,"0100a0e3","1EFF2FE1")
 * 
 * @param  {...any} args 
 */
function patchCode(...args)
{
    console.log("Process.arch：" + Process.arch);

    var nativePointer = Module.getBaseAddress(args[0]).add(args[1]);
    Memory.patchCode(nativePointer, 4, function (code) 
    {
        console.log("before======================");
        console.log(hexdump(nativePointer, { length: 0x50 }));

        if (Process.arch == "arm64")
        {
            var arm64Wt = new Arm64Writer(code, { pc: nativePointer });
            if (args.length > 2)
            {
                for (var i = 2; i < args.length; i++) 
                {
                    arm64Wt.putInstruction(reverseHex(args[i]))
                }
            }
            arm64Wt.flush();
        } else
        {
            var armWt = new ArmWriter(code, { pc: nativePointer });
            if (args.length > 2)
            {
                for (var i = 2; i < args.length; i++) 
                {
                    armWt.putInstruction(reverseHex(args[i]))
                }
            }
            armWt.flush();
        }

        console.log("\nafter======================");
        console.log(hexdump(nativePointer, { length: 0x50 }));

    });

}

function main()
{
    patchCode("libil2cpp.so", 0x601560, "0100a0e3", "1EFF2FE1");
}

setImmediate(main);
