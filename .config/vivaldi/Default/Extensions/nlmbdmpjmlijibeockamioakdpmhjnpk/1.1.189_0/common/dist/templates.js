this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["channelnotification"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing;

  return "<div class=\"stream js-filterable\">\n    <div class=\"item-image-container channel-logo\">\n        <img class=\"lazy\" alt=\"\" data-original=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.logo : stack1), depth0))
    + "\"/>\n    </div>\n    <span class=\"stream-info stream-title\">\n            "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.display_name : stack1), depth0))
    + "\n    </span>\n    <span class=\"stream-info channel-notifications-options\" data-channel-id=\""
    + alias2(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias3),(typeof helper === "function" ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\">\n        <div class=\"control-wrapper\">\n            <input type=\"checkbox\" data-notification-type=\"desktop\" id=\"dn-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.display_name : stack1), depth0))
    + "\" "
    + alias2((helpers['h-checked-2'] || (depth0 && depth0['h-checked-2']) || alias3).call(depth0,((stack1 = (depth0 != null ? depth0.notificationOpts : depth0)) != null ? stack1.desktop : stack1),{"name":"h-checked-2","hash":{},"data":data}))
    + "/>\n            <label for=\"dn-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.display_name : stack1), depth0))
    + "\">\n                <span></span>\n\n                <div class=\"control-desc\">Show desktop notification</div>\n            </label>\n        </div>\n        <div class=\"control-wrapper\">\n            <input type=\"checkbox\" data-notification-type=\"sound\" id=\"sn-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.display_name : stack1), depth0))
    + "\" "
    + alias2((helpers['h-checked-2'] || (depth0 && depth0['h-checked-2']) || alias3).call(depth0,((stack1 = (depth0 != null ? depth0.notificationOpts : depth0)) != null ? stack1.sound : stack1),{"name":"h-checked-2","hash":{},"data":data}))
    + "/>\n            <label for=\"sn-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.display_name : stack1), depth0))
    + "\">\n                <span></span>\n\n                <div class=\"control-desc\">Play sound</div>\n            </label>\n        </div>\n    </span>\n</div>\n";
},"useData":true});
this["Handlebars"]["templates"]["contextgamemenu"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "<div class=\"context-row js-follow-game\">__MSG_m83__</div>\n<div class=\"context-row js-unfollow-game\">__MSG_m84__</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.authorized : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["Handlebars"]["templates"]["contextstreammenu"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "<div class=\"context-row js-follow\">__MSG_m22__</div>\n<div class=\"context-row js-unfollow\">__MSG_m23__</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"context-row js-open-stream\" data-type=\"newlayout\">__MSG_m71__</div>\n<div class=\"context-row js-open-stream\" data-type=\"popout\">__MSG_m17__</div>\n<div class=\"context-row js-open-stream\" data-type=\"livestreamer\">__MSG_m100__</div>\n<div class=\"context-row js-open-in-multitwitch\">__MSG_m87__</div>\n<div class=\"context-row js-open-chat\">__MSG_m20__</div>\n<div class=\"context-row\" data-route=\"videos/"
    + this.escapeExpression((helpers['h-enc'] || (depth0 && depth0['h-enc']) || helpers.helperMissing).call(depth0,((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.name : stack1),{"name":"h-enc","hash":{},"data":data}))
    + "\">__MSG_m21__</div>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.authorized : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["Handlebars"]["templates"]["contributor"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"contributor js-tab tip\" title=\""
    + alias3(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"login","hash":{},"data":data}) : helper)))
    + "\" data-href=\""
    + alias3(((helper = (helper = helpers.html_url || (depth0 != null ? depth0.html_url : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"html_url","hash":{},"data":data}) : helper)))
    + "\">\n    <img class=\"user-avatar lazy\"\n         alt=\"\"\n         src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\"\n         data-original=\""
    + alias3(((helper = (helper = helpers.avatar_url || (depth0 != null ? depth0.avatar_url : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"avatar_url","hash":{},"data":data}) : helper)))
    + "s=140\"/>\n</div>";
},"useData":true});
this["Handlebars"]["templates"]["control"] = Handlebars.template({"1":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "<div class=\"control\">\n    <label>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.range : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.radio : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.button : depth0),{"name":"if","hash":{},"fn":this.program(7, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.checkbox : depth0),{"name":"if","hash":{},"fn":this.program(9, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.select : depth0),{"name":"if","hash":{},"fn":this.program(11, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.text : depth0),{"name":"if","hash":{},"fn":this.program(14, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </label>\n</div>\n";
},"2":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <div class=\"control-desc\">"
    + alias3(((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"desc","hash":{},"data":data}) : helper)))
    + "</div>\n        <div class=\"control-wrapper\">\n            <input data-type="
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + " data-id="
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + " type=\"range\" value=\""
    + alias3(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "\" min=\""
    + alias3(((helper = (helper = helpers.min || (depth0 != null ? depth0.min : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"min","hash":{},"data":data}) : helper)))
    + "\" max=\""
    + alias3(((helper = (helper = helpers.max || (depth0 != null ? depth0.max : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"max","hash":{},"data":data}) : helper)))
    + "\">\n\n            <div class=\"range-helper\">\n                <span class=\"range-helper-value\"> "
    + alias3(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + " </span> <span>"
    + alias3(((helper = (helper = helpers.tip || (depth0 != null ? depth0.tip : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"tip","hash":{},"data":data}) : helper)))
    + "</span>\n            </div>\n        </div>\n";
},"4":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper;

  return "        <div class=\"control-desc\">"
    + this.escapeExpression(((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"desc","hash":{},"data":data}) : helper)))
    + "</div>\n        <div class=\"control-wrapper\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.opts : depth0),{"name":"each","hash":{},"fn":this.program(5, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n";
},"5":function(depth0,helpers,partials,data,blockParams,depths) {
    var helper, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing, alias4="function";

  return "            <input data-type=\""
    + alias2(alias1((depths[1] != null ? depths[1].type : depths[1]), depth0))
    + "\" id=\""
    + alias2(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-id="
    + alias2(alias1((depths[1] != null ? depths[1].id : depths[1]), depth0))
    + " name=\""
    + alias2(alias1((depths[1] != null ? depths[1].id : depths[1]), depth0))
    + "\" type=\"radio\"\n                   value=\""
    + alias2(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" "
    + alias2((helpers['h-checked'] || (depth0 && depth0['h-checked']) || alias3).call(depth0,depth0,depths[1],{"name":"h-checked","hash":{},"data":data}))
    + ">\n\n            <label for=\""
    + alias2(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n                <span></span>\n                <div class=\"radio-tip\">"
    + alias2(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</div>\n            </label>\n            <br/>\n";
},"7":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <div class=\"control-wrapper\">\n            <input data-type="
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + " data-id="
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + " type=\"button\" value=\""
    + alias3(((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"desc","hash":{},"data":data}) : helper)))
    + "\">\n        </div>\n";
},"9":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <div class=\"control-wrapper\">\n            <input type=\"checkbox\" id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-type="
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + " data-id="
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + " "
    + alias3(((helper = (helper = helpers['h-checked'] || (depth0 != null ? depth0['h-checked'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"h-checked","hash":{},"data":data}) : helper)))
    + " />\n            <label for=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n                <span></span>\n\n                <div class=\"control-desc\">"
    + alias3(((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"desc","hash":{},"data":data}) : helper)))
    + "</div>\n            </label>\n        </div>\n";
},"11":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <div class=\"control-desc\">"
    + alias3(((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"desc","hash":{},"data":data}) : helper)))
    + "</div>\n        <div class=\"control-wrapper\">\n            <select data-type="
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + " data-id="
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + ">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.opts : depth0),{"name":"each","hash":{},"fn":this.program(12, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            </select>\n\n        </div>\n";
},"12":function(depth0,helpers,partials,data,blockParams,depths) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "                <option value=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\n                "
    + alias3((helpers['h-selected'] || (depth0 && depth0['h-selected']) || alias1).call(depth0,depth0,depths[1],{"name":"h-selected","hash":{},"data":data}))
    + " >"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</option>\n";
},"14":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <div class=\"control-desc\">"
    + alias3(((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"desc","hash":{},"data":data}) : helper)))
    + "</div>\n        <div class=\"control-wrapper\">\n            <input data-type="
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + " data-id="
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + " type=\"text\" value=\""
    + alias3(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "\">\n        </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.show : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
this["Handlebars"]["templates"]["game"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "<div class=\"stream game-list-item js-filterable\" data-route=\"browse/"
    + alias2((helpers['h-enc'] || (depth0 && depth0['h-enc']) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.name : stack1),{"name":"h-enc","hash":{},"data":data}))
    + "/streams\">\n    <div class=\"item-image-container game-preview\">\n        <img alt=\"\" class=\"lazy\" src=\""
    + alias2(alias3(((stack1 = ((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.box : stack1)) != null ? stack1.medium : stack1), depth0))
    + "\"/>\n    </div>\n    <span title=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.name : stack1), depth0))
    + "\" class=\"stream-info stream-title\">\n            "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.name : stack1), depth0))
    + "\n    </span>\n    <span class=\"stream-info\">\n            "
    + alias2((helpers['h-num-format'] || (depth0 && depth0['h-num-format']) || alias1).call(depth0,(depth0 != null ? depth0.viewers : depth0),{"name":"h-num-format","hash":{},"data":data}))
    + " __MSG_m45__\n        </span>\n    <span class=\"stream-info\">\n            "
    + alias2((helpers['h-num-format'] || (depth0 && depth0['h-num-format']) || alias1).call(depth0,(depth0 != null ? depth0.channels : depth0),{"name":"h-num-format","hash":{},"data":data}))
    + " __MSG_m46__\n    </span>\n</div>";
},"useData":true});
this["Handlebars"]["templates"]["gameextended"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing;

  return "<div class=\"item-image-container game-preview\">\n    <img src=\""
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.box : stack1)) != null ? stack1.medium : stack1), depth0))
    + "\" alt=\"\"/>\n    <!--<span class=\"game-follow\">-->\n    <!--<img src=\"../img/heart.svg\" alt=\"\"/>-->\n    <!--<img class=\"twin\" src=\"../img/heart.svg\" alt=\"\"/>-->\n    <!--</span>-->\n</div>\n<span class=\"stream-info stream-title\">\n            "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.name : stack1), depth0))
    + "\n    </span>\n<span class=\"stream-info\">\n            "
    + alias2((helpers['h-num-format'] || (depth0 && depth0['h-num-format']) || alias3).call(depth0,(depth0 != null ? depth0.viewers : depth0),{"name":"h-num-format","hash":{},"data":data}))
    + " __MSG_m45__\n        </span>\n<span class=\"stream-info\">\n            "
    + alias2((helpers['h-num-format'] || (depth0 && depth0['h-num-format']) || alias3).call(depth0,(depth0 != null ? depth0.channels : depth0),{"name":"h-num-format","hash":{},"data":data}))
    + " __MSG_m46__\n</span>\n<span class=\"buttons\">\n    <span class=\"button active\" data-route=\"browse/"
    + alias2((helpers['h-enc'] || (depth0 && depth0['h-enc']) || alias3).call(depth0,((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.name : stack1),{"name":"h-enc","hash":{},"data":data}))
    + "/streams\">\n        <i class=\"icon icon-camera\"></i>\n        <span>__MSG_m89__</span>\n        <div class=\"indicator\"></div>\n    </span>\n    <span class=\"button\" data-route=\"browse/"
    + alias2((helpers['h-enc'] || (depth0 && depth0['h-enc']) || alias3).call(depth0,((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.name : stack1),{"name":"h-enc","hash":{},"data":data}))
    + "/videos\">\n        <i class=\"icon icon-play\"></i>\n        <span>__MSG_m21__</span>\n        <div class=\"indicator\"></div>\n    </span>\n</span>";
},"useData":true});
this["Handlebars"]["templates"]["screenmessage"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "    <h2>"
    + this.escapeExpression(((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"header","hash":{},"data":data}) : helper)))
    + "</h2>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"screen-msg\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.header : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    <p>\n        "
    + this.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"text","hash":{},"data":data}) : helper)))
    + "\n    </p>\n</div>";
},"useData":true});
this["Handlebars"]["templates"]["stream"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "        <div class=\"stream-uptime\">\n            "
    + this.escapeExpression((helpers['h-uptime'] || (depth0 && depth0['h-uptime']) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.created_at : depth0),{"name":"h-uptime","hash":{},"data":data}))
    + "\n        </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing;

  return "<div class=\"stream js-filterable\">\n    <div class=\"item-image-container stream-preview\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.favorite : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        <img class=\"lazy\" alt=\"\" data-original=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.preview : depth0)) != null ? stack1.medium : stack1), depth0))
    + "\"/>\n    </div>\n    <span class=\"stream-info stream-title\">\n            "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.display_name : stack1), depth0))
    + "\n    </span>\n    <span class=\"stream-info stream-info-viewers\">\n            "
    + alias2(((helper = (helper = helpers.game || (depth0 != null ? depth0.game : depth0)) != null ? helper : alias3),(typeof helper === "function" ? helper.call(depth0,{"name":"game","hash":{},"data":data}) : helper)))
    + " - "
    + alias2((helpers['h-num-format'] || (depth0 && depth0['h-num-format']) || alias3).call(depth0,(depth0 != null ? depth0.viewers : depth0),{"name":"h-num-format","hash":{},"data":data}))
    + " __MSG_m45__\n        </span>\n    <span class=\"stream-info stream-info-status\" title=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.status : stack1), depth0))
    + " \">\n            "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.status : stack1), depth0))
    + "\n        </span>\n</div>\n";
},"useData":true});
this["Handlebars"]["templates"]["user"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"user-panel\">\n\n    <div class=\"dropdown\">\n        <div class=\"username dropdown-toggle\" type=\"button\" id=\"dropdownMenu2\" data-toggle=\"dropdown\" aria-expanded=\"true\">\n            <img class=\"lazy\" alt=\"\" src=\""
    + alias3(((helper = (helper = helpers.logo || (depth0 != null ? depth0.logo : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"logo","hash":{},"data":data}) : helper)))
    + "\"/>\n            "
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n            <i class=\"icon-menu\"></i>\n        </div>\n\n        <ul class=\"dropdown-menu dropdown-menu-right\" role=\"menu\" aria-labelledby=\"dropdownMenu2\">\n            <li role=\"presentation\">\n                <a role=\"menuitem\"\n                   tabindex=\"-1\" href=\"#user/notifications\">__MSG_m85__</a>\n            </li>\n            <li class=\"divider\"></li>\n            <li role=\"presentation\">\n                <a role=\"menuitem\" id=\"logout-btn\" tabindex=\"-1\"\n                   href=\"#\">__MSG_m53__</a>\n            </li>\n        </ul>\n    </div>\n\n</div>\n";
},"3":function(depth0,helpers,partials,data) {
    return "<a class=\"btn\" title=\"__MSG_m52__\" id=\"login-btn\">__MSG_m52__</a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.authenticated : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
this["Handlebars"]["templates"]["video"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"stream js-tab js-filterable\" data-href=\""
    + alias3(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"url","hash":{},"data":data}) : helper)))
    + "\">\n    <div class=\"item-image-container stream-preview\">\n        <img alt=\"\" class=\"lazy\" data-original=\""
    + alias3(((helper = (helper = helpers.preview || (depth0 != null ? depth0.preview : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"preview","hash":{},"data":data}) : helper)))
    + "\"/>\n    </div>\n    <span class=\"stream-info stream-title\" title=\""
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "\">\n            "
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "\n    </span>\n\n    <span class=\"stream-info\">\n            "
    + alias3(this.lambda(((stack1 = (depth0 != null ? depth0.channel : depth0)) != null ? stack1.display_name : stack1), depth0))
    + " - "
    + alias3(((helper = (helper = helpers.game || (depth0 != null ? depth0.game : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"game","hash":{},"data":data}) : helper)))
    + "\n    </span>\n\n    <span class=\"stream-info\">\n        "
    + alias3((helpers['h-date-format'] || (depth0 && depth0['h-date-format']) || alias1).call(depth0,(depth0 != null ? depth0.length : depth0),{"name":"h-date-format","hash":{},"data":data}))
    + " - "
    + alias3((helpers['h-prettydate'] || (depth0 && depth0['h-prettydate']) || alias1).call(depth0,(depth0 != null ? depth0.recorded_at : depth0),{"name":"h-prettydate","hash":{},"data":data}))
    + "\n    </span>\n</div>";
},"useData":true});