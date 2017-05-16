define(
	[
	 	"text!modules/model/modelist.html",
	 	"common",
	 	"content"
	],
	function(modelisthtml,common,content){
		var modelistHtml = function(){
			$('.modelist').html(modelisthtml);
		};
		var gobalColspan = 1;;
		var initGrid = function(){
			var $grid = $("#modelGrid");
			var _colModel = [
					            {label:"ID" ,name:"id",hidden:true},
					            {label:"显示名称",name:"showName"},
					            {label:"字段类型",name:"columnType",formatter : function(value, rowData) {
									if (value == '0') {
										return "业务字段";
									} else if (value == '1') {
										return "系统字段";
									}
									return value;
								}},
					            {label:"组件类型",name:"inputType"},
					            {label:"Class",name:"componentCls",hidden:true,formatter:function(){
					            	return "form-control";
					            }}
							 ],
				 gridDemoData = [
						{id:'local_11',labelField:"姓名",name:'name',xtype:"textbox"},
						{id:'local_12',labelField:"部门",name:'department',xtype:"textbox"},
						{id:'local_13',labelField: "是否在职", name: "onJob",xtype:"combobox"},
						{id:'local_14',labelField: "入职时间", name: "etime",xtype:"textbox"},
						{id:'local_15',labelField: "备注", name: "ps1",xtype:"textarea"},
						{id:'local_16',labelField:"姓名1",name:'name1',xtype:"combogrid"},
						{id:'local_17',labelField:"部门1",name:'department1',xtype:"textbox"},
						{id:'local_18',labelField: "日期", name: "onJob1",xtype:"datepicker"},
						{id:'local_19',labelField: "入职时间1", name: "etime1",xtype:"textbox"},
						{id:'local_20',labelField: "备注1", name: "ps1",xtype:"textarea"}
					],
				_setting = {
					fitStyle:"fill",
					datatype:"json",
					multiselect:true,
					editableRows: true,
					colModel:_colModel,
					data:gridDemoData,
					url:'modules/model/modelist.json',
					//onSortableLoad:true,
					onSelectRow:function(){
						selectModel(gobalColspan);
					},
					afterSortableRows:function(e,ui){
						selectModel(gobalColspan);
					},
				};
			$grid.grid(_setting);
		};
		var selectModel = function(col){
			if(!col)col=1;
			gobalColspan = col;
			var dataArraySave = [];
			var sel = $("#modelGrid").grid("option","selarrrow").concat();
			var dataIds = $("#modelGrid").grid("getDataIDs");
			var newArry = sortOrder(sel,dataIds);
			if(newArry.length != 0){
				$.each(sel, function(i){
	                var rowData = $("#modelGrid").grid("getRowData", newArry[i]);
	                rowData['labelField'] = rowData.showName;
	                rowData['xtype'] = rowData.inputType;
	                dataArraySave.push(rowData);
	            });
				var objectItems = common.selectModel(dataArraySave,col);
				var objectItems1 = $.extend(true, {}, objectItems);
				var jsonStr = content.reEdit(objectItems1);
				$(".demo").html(jsonStr);
				$.parser.parse($(".demo"));
				objectItems.renderTo = ".modelcontentArticle";
				$.coral.customRender(objectItems);
				//初始拖拽功能
				initContainer();
			}else{
				$(".demo").html("");
				$(".modelcontentArticle").html("");
			}
		}
		$("body").on("click","#one",function(){
			selectModel(1);
		});
		$("body").on("click","#two",function(){
			selectModel(2);
		});
		$("body").on("click","#three",function(){
			selectModel(3);
		});
		var sortOrder= function(ids, dataIds) {
			var array = [], orderArray=[];
			function sortNumber(a,b){
				return a - b
			}
			for (var i=0;i<ids.length;i++) {
				array.push($.inArray(ids[i], dataIds));
			}
			array = array.sort(sortNumber);
			for(var i=0;i<array.length;i++) {
				var k=array[i];
				orderArray.push(dataIds[k]);
			}
			return orderArray;
		};
		var modelist = {};
		modelist.load = function(){
			modelistHtml();
			initGrid();
        };
        return modelist;
});
