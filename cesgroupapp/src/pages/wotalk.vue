<template>
<div v-cloak>
    <mt-header title="即时通讯平台" fixed v-if="$root.transitionComplete"></mt-header>
    <div class="section">
		<div class="sectionMargin">
			<div class="mtArticle">
				<h1 class="mtArticleH1">
					<span>即时通讯平台（CES Wotalk）</span>
				</h1>
				<p>随着网络技术及国际互联网的推广，网络即时通讯（Instance Message : IM）软件也得到了迅猛的发展，其中最为典型的代表就是QQ和MSN，据最新的调查统计资料显示，网络即时通讯已经成为当今互联网应用中最为普及的应用之一。然而，当今流行的网络通讯软件产品大都为互联网应用开发，并不适合于办公室使用，为此我司围绕办公室应用环境，结合多年办公自动化软件开发的经验，自主研发了一套新一代网络即时协作软件平台产品——Wotalk。</p>
				<p>Wotalk是一款用于工作沟通的企业即时通讯软件产品，她以提高办公室工作生产效率为目，主要用于帮助用户进行办公室内外的即时交流；同时Wotalk还是一个消息中间件平台产品，他为其他应用系统提供了丰富的集成接口，其他应用系统可以借助Wotalk实现消息收发、手机短信、数据交换等功能。我司的WoTalk产品具有以下特点：</p>
				<div class="articlelist clearfix">
					<ul>
						<li><span class="font-wingdings">l</span>	<b>关注内部及相关联系人：</b>WoTalk关注企事业单位内部网而非因特网，特别是多级政府机关是产品主要面向的客户群；</li>
						<li><span class="font-wingdings">l</span>	<b>关注工作非娱乐：</b>WoTalk关注与工作相关的即时通讯与协同，而不是各种娱乐功能；</li>
						<li><span class="font-wingdings">l</span>	<b>关注即时通讯的同时结合协同办公功能：</b>WoTalk关注即时通讯但不局限于即时通讯。通过加强与协同办公系统的整合，成为嵌入在协同办公系统中的一个通用功能；</li>
						<li><span class="font-wingdings">l</span>	<b>关注集成非独立：</b>WoTalk最大的优势在于和OA系统、单点登录系统、相关应用系统的无缝集成，加强各系统之间的协同，成为系统间、模块间、用户间、任务间进行协同工作的润滑剂。</li>
					</ul>
				</div>
                <p>Wotalk采用了标准的客户端/服务器应用架构，Wotalk的整体系统架构如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/wotalk1.png" class="oneImg">
                </div>
                <p>由上图可以看出，Wotalk可以支持用户间在办公室内部和外部的无障碍沟通需求，同时通过Wotalk应用系统也能够实现相互之间的数据交换。具体来讲Wotalk可实现以下几种对象之间的交流沟通：</p>
                <div class="articlelist clearfix">
                    <ul>
                        <li>1)	内部用户之间的消息、文件等交流；</li>
                        <li>2)	内部用户与外部用户之间的的消息、文件等交流；</li>
                        <li>3)	应用系统与用户之间的即时消息；</li>
                        <li>4)	应用系统之间的数据交换；</li>
                        <li>5)	内部用户与手机用户之间的手机短信交流。</li>
                    </ul>
                </div>
                <p>Wotalk包括消息客户端和消息服务器两部分，客户机需要下载安装即时通讯客户端（可以由服务器端控制自动下载、安装和升级更新），客户端可以编辑、发送和查询个人的即时消息，进行实时聊天、文件安全传输等操作。</p>
                <p>Wotalk产品的主要应用界面如下：</p>
                <div class="articleImg clearfix">
                    <p>一、用户树界面</p>
                    <img src="../images/wotalk2.png" class="oneImg">
                </div>
                <div class="articleImg clearfix">
                    <p>二、发送消息和传输文件界面</p>
                    <img src="../images/wotalk3.png" class="oneImg">
                </div>
                <div class="articleImg clearfix">
                    <p>三、消息日志界面</p>
                    <img src="../images/wotalk4.png" class="oneImg">
                </div>
                <div class="articleImg clearfix">
                    <p>四、任务集成界面 </p>
                    <img src="../images/wotalk5.jpg" class="oneImg">
                </div>
                <div class="articleImg clearfix">
                    <p>五、发送短信界面 </p>
                    <img src="../images/wotalk6.png" class="oneImg">
                </div>
				<p>总体上来说，我司的Wotalk产品具有以下方面的优势：</p>
				<div class="articlelist clearfix">
					<ul>
                        <li>1.	功能简单实用：具备常用的IM大部分功能，特别适合政府机关和企事业单位内部使用。具体功能如即时通讯（IM）、大文件高速传输、支持短信提醒等等；</li>
                        <li>2.	支持内部通信的特殊要求，如：
                            <ul>
                                <li>a)	实名聊天：通过注册用户与用户权限平台用户的自由切换，或简单的修改配置信息，即能实现实名用户的聊天，从而达到单位内部相关制度的要求；</li>
                                <li>b)	团队会议（群聊）：群聊功能利用用户权限平台组织结构数据的支持，能实现指定人员、指定部门以及任何团队范围的聊天；</li>
                                <li>c)	离线消息处理：当对方不在线时，一般的IM系统不能进行消息的收发操作，而在我司Wotalk的消息发送界面上通过简单的选择是否为重要消息，即可进行离线消息的提醒功能，这一功能也是留言模块的一种较好实现；</li>
                                <li>d)	广播通知：为了达到把消息发送给所有在线人员的功能，如针对所有人员的通知信息，Wotalk采用了网络的广播功能。</li>
                            </ul>
                        </li>
                        <li>3.	单点登录：通过与用户权限平台集成，实现通过消息客户端登录WEB应用系统，实现所有基于Java业务系统的一次性登录，并可配合USB-Key、CA认证、LDAP等应用。</li>
                        <li>4.	短信提醒：由于采用较为规范的XML消息包格式，通过简单的格式转换可以进行短信提醒；</li>
                        <li>5.	易扩展性：业务系统与Wotalk的交互简单易用。具体可扩展性体现在：
                            <ul>
                                <li>a)	简单调用：通过直接调用Wotalk的Java API实现信息交换；</li>
                                <li>b)	消息调用：如果根据业务需求不能直接调用API（比如应用部署在不同服务器上），只需集成消息服务器提供的消息收发简单包，也可通用实现业务系统与Wotalk之间的信息交换。</li>
                            </ul>
                        </li>
                    </ul>
				</div>
			</div>
		</div>l
	</div>
</div>
</template>

<script>
    export default {

    };
</script>
<style>
    .section .articlelist ul ul{
        text-indent: 0.96rem;
    }
</style>