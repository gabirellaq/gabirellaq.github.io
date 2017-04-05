<template>
<div v-cloak>
    <mt-header title="系统管理平台" fixed v-if="$root.transitionComplete"></mt-header>
    <div class="section">
		<div class="page-video">
			<iframe width="320" height="240" src='http://player.youku.com/embed/XMjY1MTczMTE3Mg==' frameborder=0 ></iframe>
			<!--
			<video width="320" height="240" controls poster="images/authsystem_screen.jpg" preload="none" >
				<source src="http://180.168.156.212:2210/proxy/video/xitongguanlipingtai_xuanchuan.mp4" type="video/mp4">
				您的浏览器不支持 video 标签。
			</video>
			-->
		</div>
		<div class="sectionMargin">
			<div class="mtArticle">
				<h1 class="mtArticleH1">
					<span>系统管理平台（CES Sysman）</span>
				</h1>
				<p>按照传统的实施模式，每个系统建立一套独立的用户管理和权限管理，往往造成用户信息重复输入、权限分别设定，系统管理员很难进行维护，系统的扩展性很低，安全方面也造成很多漏洞。为此，我们为客户提出一个整体解决方案，将所有应用系统都建立在一个完整的用户和权限管理的平台基础之上。</p>
				<p>系统管理平台就是一款组织用户权限管理平台软件，将组织模型和权限模型通用化，形成一个独立的系统模块，为其他产品以及项目的开发提供组织用户权限管理等功能，提供整合方式应用到产品框架和项目中，实现快速的权限管理和控制，从而减少开发、维护的工作量，提高系统运行的可靠性、安全性。</p>
                <p>系统管理平台是我司一款明星产品，已在我司众多的项目中得到成功应用。目前，我司研发人员在系统管理平台3.0的基本上，通过架构升级、业务重组、功能完善，推出了全新的系统管理平台4.0版本。系统管理平台4.0在易用性、兼容性、以及安全性等方面都较之前的版本有很大的提升。</p>
                <p>系统管理平台4.0的框架结构如下：</p>
				<div class="articleImg clearfix">
					<img src="../images/authsystem1.png" class="oneImg">
				</div>
				<p>系统自下而上共分为5层：</p>
				<div class="articlelist clearfix">
					<ul>
                        <li><span class="font-wingdings">&Oslash;</span>	数据层：包括系统管理数据和应用数据（主要指应用权限数据）；</li>
						<li><span class="font-wingdings">&Oslash;</span>	数据访问层：通过通用组件的设计，采用构件化的思想处理数据库连接与文件操作，提高运行效率；</li>
						<li><span class="font-wingdings">&Oslash;</span>	逻辑层：实现系统管理平台与应用系统的接口。包括组织机构选择接口、权限验证接口、权限控制接口等；</li>
						<li><span class="font-wingdings">&Oslash;</span>	表示层：实现组织机构管理、用户管理、授权管理与系统配置等功能，并调用逻辑层接口实现对数据的操作；</li>
						<li><span class="font-wingdings">&Oslash;</span>	应用层：通过对逻辑接口的封装，实现部分系统管理的应用组件，其它应用系统可以以组件的方式集成系统管理平台。</li>
					</ul>
				</div>
				<p>从功能上来说，系统管理平台主要实现对用户组织结构、组织人员、系统资源、人员权限的维护功能，提供组织，用户，权限设置核心功能；提供分级管理、人员兼职、三员分立等特色管理需求；同时提供日志、配置等系统设置功能。平台功能组成如图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/authsystem2.png" class="oneImg">
                </div>
				<p>下面对系统管理平台的特色功能作简要介绍：</p>
				<h1><span class="iconDot"></span><a>1、灵活的组织机构自定义</a></h1>
				<p>系统管理平台支持总部、下属机构/分公司、多级部门的多级组织管理形式；能够实现对组织沿革过程中的组织关系变更的跟踪和处理；支持组织数据的导入/导出，实现组织数据的快速建立和提供。组织机构管理采用树状结构，可以灵活的定制用户组织层次，能满足各种应用变化需求而不需要进行二次开发。</p>
                <div class="articleImg clearfix">
                    <img src="../images/authsystem3.jpg" class="oneImg">
                </div>
				<h1><span class="iconDot"></span><a>2、分级的用户管理</a></h1>
				<p>目前应用软件系统的用户管理一般都是集中由系统管理员统一负责管理，针对组织机构庞大的单位，这种管理模式往往造成系统管理员的用户维护的工作量非常大。而我司的系统管理平台基于分级管理理念，将设置系统管理员、单位管理员和部门管理员分级的用户管理模式，各类管理员各司其职、分工合作，以满足多级组织政府机构和集团型客户单位分级管理的需求，减少系统管理员的相关工作，提高工作效率。</p>
				<div class="articleImg clearfix">
					<img src="../images/authsystem4.jpg" class="oneImg">
				</div>
                <p>基于分级管理理念的用户同时还支持对分级角色、角色资源和数据权限的配置；支持人员组织关系变动，在多部门身兼多职的自动赋予兼职权限；支持人员导入导出，完成人员数据的快速建立和提供。</p>
				<h1><span class="iconDot"></span><a>3、增强的权限管理</a></h1>
				<p>权限管理在传统的基于角色的权限访问控制，按角色的资源权限和数据权限分配的基础上，系统管理平台还支持“三员分立”的安全机制，大大提升了系统的安全性。</p>
				<p>系统管理平台在权限的设置上采用“三员分立”的模式，即设置了系统管理员、安全管理员和安全审计员三个角色：由系统管理员负责日常的组织机构、资源角色、授权等日常操作；由系统安全管理员负责审批系统管理员的各项操作；由系统审计员负责查看各项操作的详细日志。“三员分立”的模式充分体现权限授予的公平性与灵活性，为组建一套完备、安全的权限控制机制提供强有力的支持。“三员分立”模型如下图所示：</p>
				<div class="articleImg clearfix">
					<img src="../images/authsystem5.png" class="oneImg">
				</div>
                <p>除了常规的三员分立，系统管理平台还支持“分级三员分立机制”，即在传统常规三员分立的基础上，设置下属单位的管理员、安全员和审计员，以满足分级管理的需要。</p>
                <h1><span class="iconDot"></span><a>4、针对SAAS云平台的多租户、多系统管理策略</a></h1>
                <p>伴随着云的新概念，租户是指租用云平台产品的一个独立企业或者用户，不同的企业客户拥有自己独立的组织机构和授权模式，同时一个租户有可能会上线多套信息系统。</p>
                <p>在系统管理平台V4.0中，一个租户下，多套信息系统实现统一用户权限管理，同样，一套信息系统也可供多个用户租用，一个租户也可租用多套信息系统，并且租户间实现用户权限管理隔离。多租户管理架构如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/authsystem6.jpg" class="oneImg">
                </div>
                <p>总的来说，我司的系统管理平台有以下优势：</p>
				<div class="articlelist clearfix">
					<ul>
						<li>1、	配置灵活：系统管理平台支持对组织机构、用户、角色、权限的灵活配置；支持多级权限管理和多租户管理；满足用户各种权限管理需求；</li>
						<li>2、	安全可靠：系统管理平台采用了基于RABC的权限设计模式，符合权限设计的国际通用标准，同时还支持“三员分立”的安全机制，系统安全性能得到有效保障；</li>
						<li>3、	美观易用：系统管理平台集成了我司的基础组件平台，能兼容所有主流的浏览器，界面美观，操作方便易上手；</li>
						<li>4、	服务多样化：系统管理平台支持与其他系统的直接集成应用，也可以提供独立的SDK供其他产品/项目使用，同时也可提供组织、用户、角色、资源、用户组等特定数据的Web Services接口供调用。服务形式多样化，满足各种产品、项目的集成、调用需求；</li>
						<li>5、	平台健壮：系统管理平台采用目前主流的技术架构开发，采用模块化、构件化的设计思路，并提供了灵活的二次开发接口，支持主流的操作系统、数据库和中间件，升级简单方便，具有高性能、可扩展、跨平台、易升级等突出优点。</li>
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