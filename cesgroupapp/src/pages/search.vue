<template>
<div v-cloak>
    <mt-header title="全文检索平台" fixed v-if="$root.transitionComplete"></mt-header>
    <div class="section">
		<div class="sectionMargin">
			<div class="mtArticle">
				<h1 class="mtArticleH1">
					<span>全文检索平台（CES FSEngine）</span>
				</h1>
				<p>在对电子文件的管理过程中，必须实现对中文的快速检索，并且具有在模糊查询条件下对中文检索快速响应的能力，用普通的关系型数据库难以达到理想的效果，全文检索引擎是必然的选择，它能够从海量非结构化信息中快速、准确获得用户所需信息，从而满足用户对于海量档案数据快速检索的需要。	</p>
				<p>在对大量非结构化的电子文件检索过程中，采用普通的数据库检索根本无法满足要求，为此，我司开发了自主知识产权的全文检索引擎，实现了中量级数据记录的全文索引创建能力：</p>
				<div class="articlelist clearfix">
					<ul>
						<li><span class="font-wingdings">n</span>	支持增量索引的创建；</li>
						<li><span class="font-wingdings">n</span>	支持同义词检索；</li>
						<li><span class="font-wingdings">n</span>	支持数据库和文件混合索引的创建；</li>
						<li><span class="font-wingdings">n</span>	支持多达23万条汉词词组的切词和分词处理；</li>
						<li><span class="font-wingdings">n</span>	支持数据库网关功能，自动监控业务数据的变化情况；</li>
						<li><span class="font-wingdings">n</span>	支持txt、html、xml、xls、doc、pdf等常见格式的全文索引。</li>
					</ul>
				</div>
				<p>我司全文检索引擎的功能构成如下图所示：</p>
				<div class="articleImg clearfix">
					<img src="../images/search1.png" class="oneImg">
				</div>
				<p>整个软件由检索引擎、索引网关、管理控制台和全文检索SDK（API）四部分组成四部分组成：</p>
				<div class="articlelist clearfix">
					<ul>
						<li>检索引擎：整个软件的核心部分，负责全文检索的索引和检索等核心业务操作；</li>
						<li>索引网关：可以动态的从业务系统中提取业务数据生成索引文件，支持数据库和文件混合索引的创建；</li>
						<li>管理控制台：主要负责对全文检索引擎的业务建模，包括索引库、索引、同义词的维护以及各类系统参数的设置管理；</li>
						<li>SDK（API）：提供上层应用调用的程序接口，包括全文检索、同义词搜索、索引维护等等，提供Java API和Jsp Tag等接口方式。</li>
					</ul>
				</div>
				<p>管理控制台界面如下：</p>
				<div class="articleImg clearfix">
					<img src="../images/search2.jpg" class="oneImg">
				</div>
				<p>网关管理：</p>
				<div class="articleImg clearfix">
					<img src="../images/search3.jpg" class="oneImg">
				</div>
				<p>数据库网关配置：</p>
				<div class="articleImg clearfix">
					<img src="../images/search4.jpg" class="oneImg">
				</div>
				<p>主要特点：</p>
				<div class="articlelist clearfix">
					<ul>
						<li>1.	具有不亚于商业全文检索引擎的检索性能，百万级全文检索100用户并发情况下可以达到毫秒级响应；</li>
						<li>2.	提供可维护的检索分词库和同义词库，预收录分词库词条23万，同义词库词条5万；</li>
						<li>3.	支持txt、html、xml、xls、doc、pdf等常见文本格式的全文索引；</li>
						<li>4.	支持以时间戳和业务触发器为基本规则的增量索引建立，定时自动更新，也可以手动更新；</li>
						<li>5.	提供索引网关功能，可以自动监听业务数据的变化情况，触发索引的更新。</li>
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