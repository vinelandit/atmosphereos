var template = new Array();

template['text'] = `<div class="action" data-type="text" data-id="<%= id %>" style="background-color:<%= text.bgcolor %>;<% if (text.image !== 'null' && text.image !== null && text.image!='') { %>background-image:url('/images/<%= text.image %>')<% } %>">
	<div class="text">
		<h1 style="
		color:<%= text.color %>;
		 
		<% if (typeof text.font !== 'undefined') { %>
			font-family:<% if(text.font.indexOf('.')>-1) { %>'<% } %><%= text.font %><% if(text.font.indexOf('.')>-1) { %>'<% } %>;
		<% } %>"><%= text.headline %></h1>
		<% if (typeof text.additional !== 'undefined' && text.additional!='') { %>
			<p style="
				color:<%= text.additionalcolor %>;
				font-family:<% if(text.additionalFont.indexOf('.')>-1) { %>'<% } %><%= text.additionalFont %><% if(text.additionalFont.indexOf('.')>-1) { %>'<% } %>;
			"><%= text.additional %></p>
		<% } %>
	</div>
	<span class="customCSS" style="display:none"><% if (typeof customCSS !== 'undefined') { %><%= customCSS %><% } %></span>
	<span class="customJS" style="display:none"><% if (typeof customJS !== 'undefined') { %><%= customJS %><% } %></span>
	<div class="customCSSTarget"></div>
</div>`;


template['video'] = `<div class="action" data-type="video" data-id="<%= id %>">
	<video src="/video/<%= video.filename %>" loop preload="auto" playsinline></video>
	<span class="customCSS" style="display:none"><% if (typeof customCSS !== 'undefined') { %><%= customCSS %><% } %></span>
	<span class="customJS" style="display:none"><% if (typeof customJS !== 'undefined') { %><%= customJS %><% } %></span>
</div>`;

template['html'] = `<div class="action" data-type="html" id="action<%= actionID %>" data-duration="<%= actionDuration %>" data-fade-in="<%= actionFadeIn %>" data-fade-out="<%= actionFadeOut %>">
	<div class="htmlOuter">
		<%- actionSource %>
		<script>
			<% if(typeof startScript !== 'undefined') { %>
			function startAction<%= actionID %>() {
				<%- startScript %>
			}
			<% } %>
			<% if(typeof endScript !== 'undefined') { %>
			function endAction<%= actionID %>() {
				<%- endScript %>
			}
			<% } %>
		</script>
	</div>
</div>`;

if(typeof module !== 'undefined') {
	module.exports = {
		template:template
	}
}