<template>
<div v-cloak>
    <mt-header title="通用文件浏览器" fixed v-if="$root.transitionComplete"></mt-header>
    <div class="section">
		<div class="page-video">
			<iframe width="320" height="240" src='http://player.youku.com/embed/XMjY1MTcyOTYyOA==' frameborder=0 ></iframe>
			<!--
			<video width="320" height="240" controls poster="images/browsertool_screen.jpg" preload="none" >
				<source src="http://180.168.156.212:2210/proxy/video/tongyongwenjianliulanqi_xuanchuan.mp4" type="video/mp4">
				您的浏览器不支持 video 标签。
			</video>
			-->
		</div>
		<div class="sectionMargin">
			<div class="mtArticle">
				<h1 class="mtArticleH1">
					<span>通用文件浏览器</span>
				</h1>
				<p>随着电子政务建设的不断推进和逐步深入，各种电子文件格式大量产生，如 文本、网页、图片、音乐、视频等等，用户客户端机器需要预装各种电子文件对应的软件，否则将不能浏览该电子文件，这给用户在线浏览电子文件带来了很大不便。为了解决这一问题，存在两种解决办法：</p>
				<div class="articlelist clearfix">
					<ul>
						<li><span class="font-wingdings">&Oslash;</span>	将各种格式文件转换成一种或者多种通用格式，比如将文本文件、图像文件、图形文件转换成PDF或者OFD文件；将音视频文件转换成FLV文件。我司的文件格式转换工具已经实现此功能，在用户对于目标文件格式有明确要求的情况下可以采用这种方法；</li>
						<li><span class="font-wingdings">&Oslash;</span>	开发电子文件通用浏览器，在一个浏览器中能够浏览各种格式的电子文件。在用户不想改变原始文件格式，只想对其进行方便、快捷的利用时可以采取这种方法。</li>
					</ul>
				</div>
				<p>电子文件通用浏览器要实现支持多种电子文件浏览的功能，实质需要针对每一种电子文件格式开发相应的浏览插件。当用户利用电子文件通用浏览器访问电子文件时候，电子文件通用浏览器自动调用对应的电子文件浏览插件，进行浏览。如果在电子文件通用浏览器插件库中没有该电子文件的插件，或者新出现一种电子文件格式，则需要增加新的浏览插件。产品在系统设计时已经充分考虑扩展性，采用构件化开发方式和工厂模式进行架构设计，可根据业务需求自定义查看插件以及界面，支持项目插件自主开发并集成，保证新增插件时不会对原有格式浏览造成影响。</p>
				<p>本产品有效避免了浏览多格式文件时需要依赖不同原始生成软件环境支持的困扰，并在文件浏览时提供安全可靠的保障。产品实现原理如下图所示：</p>
				<div class="articleImg clearfix">
					<img src="../images/browsertool1.png" class="oneImg">
				</div>
                <p>从上图可以看出：</p>
                <div class="articlelist clearfix">
                    <ul>
                        <li><span class="font-wingdings">&Oslash;</span>	通用浏览器可以理解为一个文件夹（viewer），包括控制器和由一系列插件组成的插件集合，主要采用JSP页面和JS代码进行实现，通过浏览器进行展示；</li>
                        <li><span class="font-wingdings">&Oslash;</span>	本产品可放到Web项目根目录下独立运行，即可集成到Web项目中。</li>
                        <li><span class="font-wingdings">&Oslash;</span>	通用浏览器文件夹下每个子文件夹代表一个文件查看器（即插件），文件夹的名字就是该插件的名字。每个插件目录下均有个view.jsp文件，负责文件的展示。框架支持扩展新的插件。</li>
                        <li><span class="font-wingdings">&Oslash;</span>	viewer/config.js实现控制器的功能，根据配置和传递的参数，控制器负责调用合适的插件来展示。</li>
                    </ul>
                </div>
				<p>各类文件格式的浏览功能说明如下：</p>
				<h1><a>（1）文本文件</a></h1>
                <p>文本文件包含了PDF格式文本文件和非PDF格式文本文件。其中PDF格式文本文件包含下述电子文件：</p>
				<div class="articlelist clearfix">
					<ul>
                        <li><span class="font-wingdings">&Oslash;</span>	Office文件：DOC、DOCX、XLS、XLSX、PPT、PPTX；</li>
                        <li><span class="font-wingdings">&Oslash;</span>	纯文本文件：TXT、XML；</li>
                        <li><span class="font-wingdings">&Oslash;</span>	金山文件：WPS；</li>
                        <li><span class="font-wingdings">&Oslash;</span>	网页格式：HTML、HTM；</li>
                        <li><span class="font-wingdings">&Oslash;</span>	长期保存格式：PDF。</li>
                    </ul>
				</div>
                <p>而对于非PDF格式文件需要查看，则需要先将利用文件格式转换工具将文件转换为PDF格式，再进行浏览操作。</p>
				<div class="articleImg clearfix">
					<img src="../images/browsertool2.jpg" class="oneImg">
				</div>
                <p>对文本文件提供打印、首页、上一页、下一页、尾页、跳转至、适合宽度、适合高度、放大、缩小、原始大小、另存为、平移、查找、上一个、下一个、选择文字、OCR查看和数字签名操作。</p>
                <h1><a>（2）图像文件</a></h1>
                <p>图像文件主要包含了BMP、JPG、JPEG、TIF、TIFF、GIF、PNG等。查看方式分为单张查看和照片组方式查看。</p>
				<div class="articleImg clearfix">
					<img src="../images/browsertool3.jpg" class="oneImg">
				</div>
                <p>对于单张图像文件提供打印、另存为、全屏、上一页、下一页、适合宽度、适合高度、左转、右转、放大、缩小、原始大小、平移和缩放等操作。</p>
                <div class="articleImg clearfix">
                    <img src="../images/browsertool4.jpg" class="oneImg">
                </div>
                <p>在图像浏览功能基础上，对于照片组提供以下附加浏览功能：</p>
                <div class="articlelist clearfix">
                    <ul>
                        <li>1.	首页：导航至当前图像组中的第一页；</li>
                        <li>2.	末页：航至当前图像组中的最后一页；</li>
                        <li>3.	跳转至：使用跳转至进行多页之间的快速跳转，手工输入的照片页为1至照片页总数量之间，照片组有多页时有效。</li>
                    </ul>
                </div>
                <h1><a>（3）图形类</a></h1>
                <div class="articlelist clearfix">
                    <ul>
                        <li><span class="font-wingdings">&Oslash;</span>	支持对AutoCAD、Microstation、HPGL等各种软件的2D文件；</li>
                        <li><span class="font-wingdings">&Oslash;</span>	支持对ProEngineer、Unigraphics、SolidWorks、Catia、SolidEdge、Autodesk等各种软件的3D文件。</li>
                    </ul>
                </div>
                <div class="articleImg clearfix">
                    <img src="../images/browsertool5.jpg" class="twoImg">
                    <img src="../images/browsertool6.jpg" class="twoImg">
                </div>
				<p>对图形文件提供以下操作：</p>
				<div class="articlelist clearfix">
					<ul>
						<li>1.	支持 3D CAD 和 2D CAD 格式的浏览；</li>
						<li>2.	平移、旋转和操作 3D 模型并查看其 2D 模型和草图；</li>
						<li>3.	支持剖视和分解 3D 模型和装配体。</li>
					</ul>
				</div>
                <h1><a>（4）音视频类</a></h1>
                <p>音频文件格式包含了WAV、MP3、MID。</p>
                <p>音频文件浏览采用流方式直接播放进行实现，对于支持HTML5的浏览器不能直接播放的格式或者不支持HTML5的浏览器则采用实时转换的方式，将音频文件转换为MP3格式，再通过RED5流媒体服务进行播放。</p>
				<div class="articleImg clearfix">
					<img src="../images/browsertool7.jpg" class="oneImg">
				</div>
                <p>对于音频文件提供播放/暂停、停止、快进、快退、静音、音量控制和进度控制等操作。</p>
                <h1><a>（5）视频文件</a></h1>
                <p>视频文件支持的格式包含：WMV、FLV、MPG、RM、AVI、MKV、MOV、RMVB。</p>
                <p>视频文件采用流方式直接播放，对于支持HTML5的浏览器不能直接播放的格式或者不支持HTML5的浏览器则采用实时转换的方式，将视频文件转换为FLV格式，再通过RED5流媒体服务进行播放。视频文件转换采用预先转换的方式将文件转换为MP4，以供客户端播放。</p>
                <div class="articleImg clearfix">
                    <img src="../images/browsertool8.jpg" class="oneImg">
                </div>
                <p>对于视频文件提供的浏览功能在音频浏览基础上增加了全屏播放功能，可以全屏播放视频文件。</p>
				<p>产品主要特点：</p>
				<div class="articlelist clearfix">
					<ul>
                        <li>1.	以浏览器插件的方式提供，可以方便的嵌入各种常见版本的浏览器，比如IE7+，FireFox3+，Chrome16+等，并可根据HTML5支持特性选择不同类型的浏览插件；</li>
                        <li>2.	无需电子文件的原始生成软件支持，就可以支持对200多种常见文件格式的浏览，包括文本类、图像类、图形类、音视频类等各种类别；</li>
                        <li>3.	针对不同类别文件提供不同的浏览功能，比如针对图像可以缩放，针对图形支持3D旋转，针对音视频可以快进等等；</li>
                        <li>4.	除了浏览功能之外，系统还提供电子文件客户端利用安全控制功能，包括防打印下载、添加水印等；</li>
                        <li>5.	提供文件组、照片组、音视频组等二次开发接口，可集成文件格式转换工具，有效降低项目集成开发成本。</li>
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