
//获取unity版本
function il2cpp_Version()
{
	var soName = "libil2cpp.so";
    var il2cpp_get_corlib_ptr = Module.getExportByName(soName, 'il2cpp_get_corlib');
    var il2cpp_domain_get_ptr = Module.getExportByName(soName, 'il2cpp_domain_get');
    var il2cpp_domain_get_assemblies_ptr = Module.getExportByName(soName, 'il2cpp_domain_get_assemblies');
    var il2cpp_assembly_get_image_ptr = Module.getExportByName(soName, 'il2cpp_assembly_get_image');
    var il2cpp_class_from_name_ptr = Module.getExportByName(soName, 'il2cpp_class_from_name');
    var il2cpp_class_get_method_from_name_ptr = Module.getExportByName(soName, 'il2cpp_class_get_method_from_name');
    var il2cpp_image_get_name_ptr = Module.getExportByName(soName, 'il2cpp_image_get_name');
    var il2cpp_image_get_class_count_ptr = Module.getExportByName(soName, 'il2cpp_image_get_class_count');
    var il2cpp_string_new_ptr = Module.getExportByName(soName, 'il2cpp_string_new');

    var il2cpp_get_corlib = new NativeFunction(il2cpp_get_corlib_ptr, "pointer", []);
    var il2cpp_domain_get_assemblies = new NativeFunction(il2cpp_domain_get_assemblies_ptr, 'pointer', ['pointer', 'pointer']);
    var il2cpp_assembly_get_image = new NativeFunction(il2cpp_assembly_get_image_ptr, 'pointer', ['pointer']);
    var il2cpp_class_from_name = new NativeFunction(il2cpp_class_from_name_ptr, "pointer", ["pointer", "pointer", "pointer"]);
    var il2cpp_class_get_method_from_name = new NativeFunction(il2cpp_class_get_method_from_name_ptr, "pointer", ["pointer", "pointer", "int"]);
    var il2cpp_image_get_name = new NativeFunction(il2cpp_image_get_name_ptr, "pointer", ["pointer"]);
    var il2cpp_image_get_class_count = new NativeFunction(il2cpp_image_get_class_count_ptr, "pointer", ["pointer"]);
    var il2cpp_string_new = new NativeFunction(il2cpp_string_new_ptr, "pointer", ["pointer"]);

    //存放所有的dll的指针
    const all_dll_ptr = Memory.alloc(Process.pointerSize * 100);
    var assemblies = il2cpp_domain_get_assemblies(il2cpp_domain_get_ptr, all_dll_ptr);

    var UnityEngine_str = Memory.allocUtf8String("UnityEngine");
    var Application_str = Memory.allocUtf8String("Application");
	var get_unityVersion_str = Memory.allocUtf8String("get_unityVersion");

    for (let index = 0; index < 100; index++)
    {
        //console.log("index== "+assemblies.add(Process.pointerSize*index));
        try
        {
            var dll_ptr = il2cpp_assembly_get_image(assemblies.add(Process.pointerSize * index)).readPointer();
        } catch (error)
        {
			return;
        }

        //console.log(JSON.stringify("dll_ptr :"+dll_ptr, null, 4));
        if (dll_ptr >= 0x100000)
        {
            var dll = il2cpp_image_get_name(dll_ptr);
            //console.log(dll.readUtf8String());
            if (dll.readUtf8String() == "UnityEngine.CoreModule.dll")
            {
                //console.log(dll.readUtf8String());
                //var classCount = il2cpp_image_get_class_count(dll_ptr);
                var Application = il2cpp_class_from_name(dll_ptr, UnityEngine_str, Application_str)

                try
                {
                    var get_unityVersion = il2cpp_class_get_method_from_name(Application, get_unityVersion_str, 0);
                    var get_unityVersion_ptr = new NativeFunction(get_unityVersion.readPointer(), 'pointer', []);
					
					//主动调用 get_unityVersion 方法
                    console.log("\n unity版本:\n " + get_unityVersion_ptr().add(20).readUtf16String()+"\n");
                } catch (error)
                {
                    console.log("无法获取 unity 版本，需手动查找");
                }

            }
        }
    }
}


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
 * args[2]，args[2]，args[x]: 要改变的16进制码,可以有多个,指令大小写均可
 * 
 * 例:
 * patchCode("libil2cpp.so",0x601560,"01 00 a0 e3","1E FF 2F E1")
 * patchCode("libil2cpp.so",0x711340,"C0 03 5F D6")
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
            console.log("\n\n改之前======================");
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

            console.log("\n\n改之后======================");
            console.log(hexdump(nativePointer, { length: 0x50 }));
        });
    } else
    {
        console.log("\n参数不够。。。");
    }


}

function main()
{
	il2cpp_Version();
	/**
	
	常用指令：
	==============ARM32=============
	NOP                 (00 F0 20 E3)
	MOV    r0,#0        (00 00 A0 E3)
	MOV    r0,#1        (01 00 A0 E3)
	MOV    r0,#100      (64 00 A0 E3)
	MOV    r0,#0xffffff (FF 04 E0 E3)
	BX     LR           (1E FF 2F E1)
	================================
	
	==============ARM64=============
	NOP                 (1F 20 03 D5)
	MOV    X0,#0        (00 00 80 D2)
	MOV    X0,#1        (20 00 80 D2)
	MOV    X0,#100      (80 0C 80 D2)
	MOV    X0,#0xffffff (E0 5F 40 B2)
	RET                 (C0 03 5F D6)
	================================
	*/
    patchCode("libil2cpp.so", 0x14a126c, "20 00 80 52", "C0 03 5F D6");
}

//setTimeout(main, 3000);
setImmediate(main);








