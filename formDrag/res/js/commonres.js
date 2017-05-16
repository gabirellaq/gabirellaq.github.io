var currentSystemId=null;
var ctx = null;
function getRealPath(){
	  //获取当前网址，如： http://localhost:8083/myproj/view/my.jsp
	   var curWwwPath=window.document.location.href;
	   //获取主机地址之后的目录，如： myproj/view/my.jsp
	  var pathName=window.document.location.pathname;
	  var pos=curWwwPath.indexOf(pathName);
	  //获取主机地址，如： http://localhost:8083
	  var localhostPaht=curWwwPath.substring(0,pos);
	  //获取带"/"的项目名，如：/myproj
	  var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);
	 
	 //得到了 http://localhost:8083/myproj
	  var realPath=localhostPaht+projectName;
	  ctx = realPath+"/";
}

getRealPath();

/**
 * 获取url参数
 * @param name
 * @returns
 */
function GetQueryValue(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return unescape(r[2]); 
     return null;
}

function initCoralForm($form,formData, type){
	$.parser.parse($form);
	$form.form("loadData", formData);
	if (type === 'detail'){
		$form.form("setReadOnly", true);
	}
}

function clearCoralForm($form){
	$form.form("clear");
}

function openDialog($dialog){
  $dialog.dialog("open");
}

function closeDialog($dialog){
  $dialog.dialog("close");
}

function message(msg){
	$.message({message:msg, cls:"message"});
}
function warning(msg){
	$.message({message:"警告！"+msg, cls:"warning"});
}
function error(eMsg){
	
	var msg;
	if(eMsg&&eMsg['statusText']&&(eMsg['statusText'].indexOf('NetworkError')!=-1 || eMsg['statusText'].indexOf('error')!=-1)){
		$.message({message:"错误！网络异常，有可能断网或后台服务停止服务", cls:"danger"});
		return;
	}
	if(eMsg&&eMsg.responseText&&eMsg.responseText.indexOf("权限")!=-1){
		return;
	}
	if(eMsg&&eMsg['statusText']&&(eMsg['statusText'].indexOf('abort')!=-1)){
		return;
	}
	if((typeof eMsg)=='string'){
		$.message({message:"错误！"+eMsg, cls:"danger"});
		return;
	}
	
	try{
		//msg = jQuery.parseJSON($.trim(eMsg.responseText)).message;
		msg = eMsg.responseText;
		if(msg&&msg.indexOf('message\":')!=-1&&msg.indexOf(',\"code')!=-1){
			msg = msg.substring(msg.indexOf('message\":')+('message\":'.length), msg.indexOf(',\"code'));
			if(msg.lastIndexOf("Exception: ")!=-1){
				msg = msg.substring(msg.lastIndexOf('Exception: ')+('Exception: '.length));
			}
		} else {
			return;
		}
	}catch(e){
		if((typeof eMsg)=='string'){
			msg = eMsg;
		}else if(eMsg.statusText=='abort'){
			return;
		}else{
			msg = e.message;
		}
		//console.log(e);
	}
	if(msg&&msg.indexOf("Unable")!=-1){
		return;
	}
	if(!msg){
		msg="系统异常！";
	}
	$.message({message:"错误！"+msg, cls:"danger"});
}
//检查唯一性
function checkUnique(){
	var value = this.value;
	var url = this.form.action;
	if(!url)return;
	var moduleName = null;
	var menuName = null;
	if(url.indexOf("!")!=-1){
		moduleName = url.substring(url.lastIndexOf("/")+1,url.indexOf("!")); //获取模块名称, 如/infoplat/backstage/system/user!, 则返回user
		menuName = url.substring(url.lastIndexOf("/",url.lastIndexOf("/")-1)+1,url.lastIndexOf("/")); //获取菜单名称, 如/infoplat/backstage/system/user!, 则返回system
		url = url.substring(0,url.indexOf("!"));
	}
	url = url+"!checkUnique.json";

	var name = this.name;
	var id = this.form.id.value;

	var dataJson = {};
	dataJson["Q_EQ_"+name] = value;
	dataJson["id"] = id;
	var errorMessage = value+"已经存在！";
	var result ={};

	$.ajax({
		type: 'post',
		url	: url,
		data: dataJson,
		dataType: 'json',
		async: false,
		success	: function(data){
			result = { isValid: data, errMsg: errorMessage };
		},
		error: function(e){
			error(e);
		}
	});
	return result;
}

function gridSortableRows(e, ui){
	//debugger;
	var grid = $("#"+e.target.id);
	var url = grid.grid("option","url");
	/* var datatype = grid.grid("option","datatype");
	if(datatype&&datatype=="local"){
		return;
	} */
	if(!url)return;
	if(url.indexOf("!")!=-1){
		url = url.substring(0,url.indexOf("!"));
	}
	url = url+"!sort.json";
	var sortAfterIDs = ui.permutation.join();
	var sortBeforeIDs = ui.originalPermutation.join();
	//alert(ui.permutation.length);
	 $.ajax({
		type: 'post',
		url	: url,
		data: {
				"sort.sortAfterIDs": sortAfterIDs,
				"sort.sortBeforeIDs":sortBeforeIDs
		},
		dataType: 'json',
		success	: function(data){
			message("排序成功");
		},
		error: function(e){
			error(e);
		}
	});
}

function loading(msg){
	$.loading({
		position: "overlay",
		text: msg
	});
}
function hide(){
	$.loading("hide");
}

function refreshAppGrid(){
	window.jQuery.publish("modules.appdefine.grid.reload");
}

function openWindow(url){
	window.open(url);
}
