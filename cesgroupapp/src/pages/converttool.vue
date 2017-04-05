<template>
<div v-cloak>
    <mt-header title="文件格式转换工具" fixed v-if="$root.transitionComplete"></mt-header>
    <div class="section">
		<div class="page-video">
			<iframe width="320" height="240" src='http://player.youku.com/embed/XMjY1MTczMDQ0OA==' frameborder=0 ></iframe>
			<!--
			<video width="320" height="240" controls poster="images/converttool_screen.jpg" preload="none" >
				<source src="http://180.168.156.212:2210/proxy/video/wenjiangeshizhuanhuangongju_xuanchuan.mp4" type="video/mp4">
				您的浏览器不支持 video 标签。
			</video>
			-->
		</div>
		<div class="sectionMargin">
			<div class="mtArticle">
				<h1 class="mtArticleH1">
					<span>文件格式转换工具</span>
				</h1>
				<p>档案信息资源是人类社会的基础性资源，构成档案信息资源的是一个个的文件，根据《电子文件归档与电子档案管理规范》（GB/T 18894-2016）中的定义，电子文件的类型大致可分为文本、图形（矢量）、图像（位图）、录音录像和媒体社交等五大类。每种类别的文件又有多种不同的格式，比如常见的文件格式包括但不限于：</p>
				<div class="articlelist clearfix">
					<ul>
						<li><span class="font-wingdings">l</span>	文本文件：DOC、DOCX、XLS、XLSX、PPT、PPTX、TXT、XML、WPS、PDF等；</li>
						<li><span class="font-wingdings">l</span>	图像文件：BMP、JPG、JPEG、TIF、TIFF、GIF、PNG等；</li>
						<li><span class="font-wingdings">l</span>	图形文件：DWG、DXF、IGS、SVG等；</li>
						<li><span class="font-wingdings">l</span>	录音录像：WAV、MP3、MI、WMV、FLV、MPG、RM、AVI、MKV、MOV、RMVB等；</li>
						<li><span class="font-wingdings">l</span>	媒体社交：HTML、MHT、CSS、JS等。</li>
					</ul>
				</div>
                <p>可以想象，多达几百种的文件格式的存在对各个立档单位电子文件的归档管理工作造成了诸多困扰，也使档案馆对所接收电子文件的长期有效性无法保证，归档电子文件的利用更是无从谈起。</p>
                <p>为了解决这一问题，我司设计开发了文件格式转换软件，尽可能将各种文件格式转换为适合归档、能够长期有效保存并且方便利用的格式，为电子文件的归档、管理和利用提供方便。</p>
                <p>按照《版式电子文件长期保存格式需求》（DA/T47-2009）中的要求，电子文件长期保存格式的选型必须满足10项基本条件，经过对各种常见格式的选型，选择PDF、SWF、OFD、JPG、MP3、MP4和FLV格式作为文件格式转换的目标格式。其中PDF格式已经在2005年被接纳为国际标准ISO19005-1（PDF/A-1），并于2009年通过中国国家标准认定，标准号为GB/T 23286.1；OFD格式已于2016年正式成为版式文件国家标准，标准号为GB/T 33190；FLV格式是当前风靡网络的Flash音视频格式，虽然目前还不是国际标准格式，但已经是事实上的标准，国内知名的视频分享网站比如优酷土豆就采用了FLV格式。</p>
                <p>《电子文件归档与电子档案管理规范》中定义的五种类别的若干种文件格式，将通过文件格式转换软件被转换成相应的目标文件格式，转换对应关系如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/converttool1.png" class="oneImg">
                </div>
                <p>在实际安装部署过程中，文件格式转换软件一般安装在一台独立的文件格式转换服务器中，以后台服务的方式运行。转换服务采用轮询机制监控指定目录，并将指定目录下的源文件（待转换文件）转换成目标文件，如下图所示：</p>
                <div class="articleImg clearfix">
                    <img src="../images/converttool2.gif" class="oneImg">
                    <img src="../images/converttool3.png" class="oneImg">
                </div>
                <p>流程说明如下：</p>
                <div class="articlelist clearfix">
                    <ul>
                        <li>1）转换工具客户端将文件服务器中的电子文件信息写入数据服务器中；</li>
                        <li>2）转换器读取电子文件信息和转换方案，并从文件服务器上获取需要转换的电子文件进行格式转换；</li>
                        <li>3）转换成功后将电子文件保存至文件服务器，同时将日志信息存入数据库服务器中。</li>
                    </ul>
                </div>
                <p>相关功能介绍如下：</p>
                <h1><a>1、主界面</a></h1>
                <p>主界面上包含整个软件的功能模块入口以及转换数据的统计信息，启动文件格式转换软件时同时启动悬浮窗。</p>
                <div class="articleImg clearfix">
                    <img src="../images/converttool4.jpg" class="oneImg">
                </div>
                <h1><a>2、系统配置</a></h1>
                <p>系统配置主要是配置系统参数，包括监控模式配置、通用参数配置和转换方案配置三种配置方式。</p>
                <div class="articleImg clearfix">
                    <img src="../images/converttool5.jpg" class="oneImg">
                </div>
                <h1><a>3、运行界面</a></h1>
                <p>运行中界面能够直观显示转换过程，实时更新转换信息。</p>
                <div class="articleImg clearfix">
                    <img src="../images/converttool6.jpg" class="oneImg">
                </div>
                <h1><a>4、方案预览</a></h1>
                <p>预览当前设定的监控模式下所有用到的转换方案，目录监控模式支持单个方案预览，数据库监控模式支持多个方案预览。</p>
                <div class="articleImg clearfix">
                    <img src="../images/converttool7.jpg" class="oneImg">
                </div>
                <h1><a>5、统计信息</a></h1>
                <p>本模块统计了文件格式转换软件的转换统计信息、内存与CPU实时占用信息。</p>
                <div class="articleImg clearfix">
                    <img src="../images/converttool8.jpg" class="oneImg">
                </div>
                <p>产品主要特点：</p>
                <div class="articlelist clearfix">
                    <ul>
                        <li>1. 选择符合国家文件版式规范的OFD格式及接受度高的PDF格式、FLV格式和MP3格式等作为转换目标格式，支持五大类上百种格式向目标格式的转换；</li>
                        <li>2. 转换过程中无需长时间开启界面，只需由悬浮窗来展示运行状态；可根据用户配置动态生成方案导图，方便用户理解配置信息；</li>
                        <li>3. 转换引擎运算速度快，出错率低，转换精度高；转换操作全自动化完成，不需要人工干预；</li>
                        <li>4. 在用户存在大量历史数据继续处理、转换效率要求较高等情况下，支持多台转换服务器同时部署，协作运行；</li>
                        <li>5. 转换的同时可以完成缩略图生成、多页合并、元数据嵌入、水印添加等附带操作，满足用户全方位需要；</li>
                        <li>6. 转换过程有详细的日志记录，对于转换失败的文件一方面系统会尝试重新转换，另一方面也便于用户快速定位错误。</li>
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
