<template>
<div v-cloak>
    <mt-header title="基础组件平台" fixed v-if="$root.transitionComplete"></mt-header>
    <div class="section">
		<div class="sectionMargin">
			<div class="mtArticle">
				<h1 class="mtArticleH1">
					<span>基础组件平台（CES Coral）</span>
				</h1>
				<p>组件（Component）技术是各种软件重用方法中最重要的一种方法。基于组件开发的软件可更快的生成并达到更高的质量；基于组件开发的软件也将使软件的维护变得更加容易。因此，基于组件开发软件已成为降低软件开发成本，提高软件质量的一种有效途径。</p>
				<p>所谓组件，其实就是一种可部署软件的代码包，其中包括某些可执行模块。组件单独开发并作为软件单元使用，它具有明确的接口，软件就是通过这些接口调用组件所能提供的服务，多种组件可以联合起来构成更大型的组件乃至直接建立整个系统。组件必须是自包含的，组件设计中必须包括需求、源代码和可执行代码、接口规范、分析和设计模型、测试和其他同类术语。组件的实现必须支持一种或者多种其用户所希望获得的接口。</p>
				<p>我司在多年J2EE软件开发经验积累的基础上，吸收国外先进的设计思想和设计模式，建立了全公司范围的基础组件平台。我司的基础组件平台经过多年的不断更新和完善，目前已经升级到基础组件平台4.0版本。基础组件平台4.0的逻辑架构如下所示：</p>
				<div class="articleImg clearfix">
					<img src="../images/coral1.png" class="oneImg">
				</div>
				<p>从上图可以看出，基础组件平台（CES Coral）包括js组件、image组件、css组件、tag组件、界面模板组件、工具组件、子系统组件、基础组件、组件发布平台等部分，可应用于信息系统开发的各个层面。组将库将系统处理过程中的通用功能（界面处理、数据库连接池、数据访问、文件处理、消息处理、例外日志、标签库、数据库自定义等）进行抽象，具有良好继承性和扩展性的类基础架构，封装了产品研发项目和应用开发项目中共性的功能。在后续的产品研发和项目开发中也可调用基础组件平台中各类组件进行开发建设，提高软件开发效率和质量。</p>
				<p>下图是组件调用的用例图：</p>
				<div class="articleImg clearfix">
					<img src="../images/coral2.png" class="oneImg">
				</div>
				<p>同时，基础组件平台4.0提供了良好的前台展示功能，基于jquery1.9+开发，同时也结合了标签技术，另外组件后台交互的数据模型也与我司的软件框架完美结合。基础组件平台4.0目前提供了表单类、表格类、导航类、其他类共4类组件，如下图所示：</p>
				<div class="articleImg clearfix">
					<img src="../images/coral3.jpg" class="oneImg">
				</div>
				<p>部分组件样式如下图所示：</p>
				<div class="articleImg clearfix">
					<img src="../images/coral4.jpg" class="oneImg">
				</div>
				<p>通过调用基础组件平台中的组件快速形成的软件系统界面框架如下图所示：</p>
				<div class="articleImg clearfix">
					<img src="../images/coral5.jpg" class="oneImg">
				</div>
				<p>除各类基础组件外，基础组件平台4.0提供了完善的调用例子程序和二次开发手册，所有组件的培训教材、二次开发手册、产品示例、界面原型等等都能够方便的从平台上获取。基础组件平台4.0的首页面示意如下：</p>
				<div class="articleImg clearfix">
					<img src="../images/coral6.jpg" class="oneImg">
				</div>
				<p>基础组件平台4.0具有易学性、易维护性、易用性、可扩展性、规范性的特点，将有效的为技术总监、开发经理、开发工程师等提升开发效率。基础组件平台4.0已经在我司众多的中型以上的项目和产品中得到应用，为项目和产品的按期交付、保证质量起到了保驾护航的作用。</p>
				<div class="articleImg clearfix">
					<img src="../images/coral7.jpg" class="oneImg">
				</div>
				<p>总的来说，基础组件平台4.0具有如下优势：</p>
				<div class="articlelist clearfix">
					<ul>
						<li>1.	既包括逻辑层组件，也包括表示层组件，既可以起到规范开发接口的作用，也可以起到统一应用系统界面的作用；其中表示层组件包含表单类、表格类、导航类、其他类4类共上百个组件，并且随着平台的不断升级和完善，组件的数量还会不断的增加，为各类不同的项目提供基础支撑；</li>
						<li>2.	所有组件兼容目前所有主流的浏览器，具体包括IE、Chrome、Firefox、Safari、Opera以及以这5种浏览器为内核的其他浏览器。所有的组件在不同浏览器系统的界面上展现效果一致，极大的提升了用户体验；</li>
						<li>3.	所有的组件控件都支持拖拽操作的属性、事件和API接口，同时所有组件界面优美、操作流畅，提供了良好的操作体验，给使用者带来了愉悦的工作心境；</li>
						<li>4.	提供全新打造的基于开源jquery1.9+类库，结合标签技术，专注于前端页面展示的技术框架，体积小、功能强；</li>
						<li>5.	通过引用Jsp Tag File（自定义标签），统一各组件调用方法，专注“通用需求”，定制“个性需求”，使组件库更加便于复用、便于扩展、易于集成。</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script>
    export default {

    };
</script>