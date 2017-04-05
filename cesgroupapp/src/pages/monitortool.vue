<template>
<div v-cloak>
    <mt-header title="服务监控工具" fixed v-if="$root.transitionComplete"></mt-header>
    <div class="section">
		<div class="sectionMargin">
			<div class="mtArticle">
				<h1 class="mtArticleH1">
					<span>服务监控工具</span>
				</h1>
                <p>服务监控工具是为提高IT运维服务的效率和效果而开发的一套信息技术监控系统，是基于信息化数据获取和展示的功能强大且灵活的监控系统，具有可定制性、可扩展性、简洁、高效的特点。</p>
                <p>服务监控工具可同时监控大量网络设备、服务器状态、中间件服务、应用系统等资源，同时系统引用了SLA的概念，通过将复杂的系统进行分解监控、提取和计算可用性数据，通过业务视图等方式展示给用户进行事务管理。同时工具通过可定制化的事件预警通知机制，管理员可以针对不同事件分级告警。</p>
                <p>服务监控工具致力于服务业务，从业务的角度来监控资源数据，我们的产品主要关注以下三点：</p>
				<div class="articlelist clearfix">
					<ul>
                        <li><span class="font-wingdings">l</span>	及时发现故障；</li>
                        <li><span class="font-wingdings">l</span>	核心业务系统可视化；</li>
                        <li><span class="font-wingdings">l</span>	设备容量趋势化统计</li>
                    </ul>
				</div>
                <div class="articleImg clearfix">
                    <img src="../images/monitortool1.jpg" class="oneImg">
                </div>
                <p>服务监控工具的系统架构如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/monitortool2.jpg" class="oneImg">
                </div>
                <p>服务监控工具的主要功能特色如下：</p>
                <h1><a>1、强大的监控能力</a></h1>
                <p>工具基于标准协议设备的监控，可定制脚本监控，可以监控市场上大部分的设备资源，具体如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/monitortool3.jpg" class="oneImg">
                </div>
                <h1><a>2、拓扑图快速发现异常</a></h1>
                <p>支持手动绘制拓扑图，具有灵活的编辑的显示功能，方便用户现场大屏展示。同时拓扑图对于异常情况高亮显示，用户可以点击异常设备快速发现定位异常问题。生成的拓扑图示意如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/monitortool4.jpg" class="oneImg">
                </div>
                <h1><a>3、业务视角分层监控</a></h1>
                <p>服务监控工具将业务系统进行分解监控，从业务的视角看问题，真实反应业务系统运行情况及其所依赖设备的运行情况，如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/monitortool5.jpg" class="oneImg">
                </div>
                <p>服务监控工具将业务层层分解监控，按照组件之间建立依赖和连接关系，形成业务视图，便于故障快速定位。业务视图如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/monitortool6.jpg" class="oneImg">
                </div>
                <h1><a>4、动态屏幕展示</a></h1>
                <p>服务监控工具支持将拓扑图、机柜图、趋势图等汇总成动态屏幕，定时切换屏幕，适用于大屏监控。</p>
                <div class="articleImg clearfix">
                    <img src="../images/monitortool7.jpg" class="oneImg">
                </div>
                <h1><a>5、移动端展示</a></h1>
                <p>系统支持移动端展示，可以方便用户更便捷的接收报警信息、更便捷、更准确的查看巡检报告。移动端应用如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/monitortool8.jpg" class="oneImg">
                </div>
                <h1><a>6、自定义统计分析</a></h1>
                <p>服务监控工具可以自定义监控数据，形成趋势图，便于统计分析。</p>
                <div class="articleImg clearfix">
                    <img src="../images/monitortool9.jpg" class="oneImg">
                </div>
                <p>服务监控工具主要特点：</p>
				<div class="articlelist clearfix">
					<ul>
                        <li><span class="font-wingdings">l</span>	支持SNMP、IPMI、HTTP、ICMP等多种协议，还可以定制个性化脚本，可以实现各类计算机软硬件设别的监控；</li>
                        <li><span class="font-wingdings">l</span>	监控信息支持图形化统计分析和移动端输出，界面直观大方，操作便捷易用，各类报告一览无余；</li>
                        <li><span class="font-wingdings">l</span>	系统支持监控软硬件设备的拓扑图生成，同时拓扑图对于异常情况高亮显示，用户可以点击异常设备快速发现定位异常问题，确保第一时间排除故障；</li>
                        <li><span class="font-wingdings">l</span>	监控工具将业务系统进行分解监控，从业务的视角看问题，真实反应业务系统运行情况及其所依赖设备的运行情况；</li>
                        <li><span class="font-wingdings">l</span>	工具提供了完善的API接口，便于扩展和和集成。</li>
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