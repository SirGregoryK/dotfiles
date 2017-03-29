// YouTube™ utilizes the history.pushState() API to navigate to/between videos. Content scripts
// do not run again after a history state change. To work around that, this content script keeps
// running to periodically check if a new video was loaded.
// 
// I've considered using the webNavigation API, but that requires a browser-wide "Access your
// browsing activity" permission. That's just not very user-friendly.

(function () {

    var UPDATE_INTERVAL = isMaterial() ? 100 : 500;

    // Material design is updated more frequently because the UI works differently, making delays
    // more noticeable. Updates are very lightweight: just a check if the URL has changed, if it
    // hasn't, nothing happens.

    var TAG_ELEMENT_STYLE = "display: inline-block;"
        + "padding-top: 4px;"
        + "padding-bottom: 4px;"
        + "padding-right: 12px;";

    var OUTPUT_ELEMENT_ID = "TFYT_OUTPUT";
    var OUTPUT_ELEMENT_STYLE_OLD = "float: left; width: 70%;";

    var MATERIAL_MORE_BUTTON_SELECTOR = "paper-button#more";
    var MATERIAL_LESS_BUTTON_SELECTOR = "paper-button#less";

    var MATERIAL_LINK_STYLE = "text-decoration: none;"
        + "color: hsl(206.1, 79.3%, 52.7%);"
        + "cursor: pointer;"
        + "display: inline-block";

    var lastPageUrl = null;

    /**
     * Returns `true` if YouTube™'s new material design layout is active.
     */
    function isMaterial() {
        return document.getElementsByTagName("ytd-app").length > 0;
    }

    /**
     * Returns `true` if the current page is a YouTube™ video page.
     */
    function isVideoPage() {
        return location.href.indexOf("/watch") !== -1;
    }

    /**
     * Returns `true` if the user has navigated to a new page since the last update.
     */
    function hasNavigated() {
        return location.href !== lastPageUrl;
    }

    /**
     * Updates the current page if needed.
     */
    function update() {
        if (isVideoPage() && hasNavigated()) {
            lastPageUrl = location.href;
            loadTagsHtml(function (html) {
                var tags = parseTagsHtml(html);
                displayTags(tags);
            });
        }
    }

    /**
     * Loads the HTML containing the tags.
     */
    function loadTagsHtml(callback) {

        // When a video was loaded through AJAX, as opposed to navigating to it directly, the tags are
        // *not present* in the document. So yup, this script has to send a GET to the current URL, and
        // parse the HTML in the response. `document.body.innerHTML` or similar just wouldn't work.

        var xhr = new XMLHttpRequest();

        xhr.open("GET", location.href, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr.responseText);
            }
        };

        xhr.send();
    }

    /**
     * Returns an array of tags parsed from the HTML loaded by `loadTagsHtml`.
     */
    function parseTagsHtml(html) {

        function decode(tag) {

            // Decode escaped Unicode strings:

            tag = tag.replace(/\\u([\d\w]{4})/gi, function (_, group) {
                return String.fromCharCode(parseInt(group, 16));
            });

            return decodeURIComponent(tag);
        }

        var match = /"keywords":"([^"]*)"/.exec(html);

        if (match)  {
            return match[1].split(",").map(decode).filter(function (t) {
                return t !== "";
            });
        }
        
        return ["ERROR"];
    }

    /**
     * Displays the specified tags on the current video page.
     */
    function displayTags(tags) {

        var outputElement = tryLoadOutputElement();

        if (!outputElement) {

            // The YouTube™ UI was probably not fully initialized yet, so the output element could
            // not be created. Either that, or they made a breaking change to the code. Wait a
            // moment and try again.
            // 
            // Note: the UI may not get initialized until the browser tab is opened! That's why
            // there's no limit to the number of retries.

            setTimeout(function () {
                displayTags(tags);
            }, 1000);

            return;
        }

        // (Re)set initial output element state
        // ====================================

        outputElement.innerHTML = "";

        if (isMaterial()) {

            // Set margins ONLY if tags are present, so there's no large blank space in the page:

            outputElement.style.marginTop = tags.length > 0 ? "20px" : "0";
            outputElement.style.marginBottom = tags.length > 0 ? "10px" : "0";

            tryCollapseMaterialOutputElement(outputElement);
        }

        // Generate tag elements
        // =====================

        for (var i = 0; i < tags.length; i++) {

            var tag = tags[i];

            // Create span:

            var tagElement = document.createElement("span");
            tagElement.setAttribute("style", TAG_ELEMENT_STYLE);
            outputElement.appendChild(tagElement);

            // Create a[href="/results?search_query={tag}"]:

            var linkElement = document.createElement("a");
            linkElement.setAttribute("target", "_blank");
            linkElement.setAttribute("href", "/results?search_query=" + encodeURIComponent(tag));
            linkElement.innerText = tag;
            tagElement.appendChild(linkElement);

            if (isMaterial()) {
                linkElement.setAttribute("style", MATERIAL_LINK_STYLE);
            }

            // Create invisible comma, for copy-paste convenience:

            var commaElement = document.createElement("span");
            commaElement.setAttribute("style", "opacity: 0;");
            commaElement.innerText = ", ";
            tagElement.appendChild(commaElement);
        }
    }

    /**
     * Attempts to load and return the tags output element. Returns `null` on failure.
     */
    function tryLoadOutputElement() {

        var outputElement = document.getElementById(OUTPUT_ELEMENT_ID);

        if (outputElement) {
            return outputElement;
        }

        return isMaterial() ? tryLoadMaterialOutputElement() : tryLoadOldOutputElement();
    }

    /**
     * Attempts to create and return a tags output element in the material design layout.
     */
    function tryLoadMaterialOutputElement() {

        var containerElement = document.querySelector("ytd-expander ytd-metadata-row-container-renderer");

        if (!containerElement) {
            return null;
        }

        // The official video metadata elements are found in a "#container" element, which can be
        // expanded/collapsed with buttons. Unfortunately, collapsing that element doesn't just
        // hide it: all child elements are removed from the DOM. 
        // 
        // This makes it impossible to place the tags in that element and have expand/collapse work
        // out of the box. The simplest workaround is just to place the tags in their own <div>...:

        var outputElement = document.createElement("div");
        outputElement.id = OUTPUT_ELEMENT_ID;
        containerElement.appendChild(outputElement);

        // ...and hook them up to the expand/collapse buttons separately:

        var showMoreButton = document.querySelector(MATERIAL_MORE_BUTTON_SELECTOR);
        var showLessButton = document.querySelector(MATERIAL_LESS_BUTTON_SELECTOR);

        if (showMoreButton && showLessButton) {

            showMoreButton.addEventListener("click", function (e)  {
                outputElement.style.display = "block";
            });

            showLessButton.addEventListener("click", function (e) {
                outputElement.style.display = "none";
            });
        }

        return outputElement;
    }

    /**
     * Attempts to create and return a tags output element in the old layout.
     */
    function tryLoadOldOutputElement() {

        var containerElement = document.querySelector("ul.watch-extras-section");

        if (!containerElement) {
            return null;
        }

        // Create li.watch-meta-item > div.content:

        var outputElement = document.createElement("div");
        outputElement.id = OUTPUT_ELEMENT_ID;
        outputElement.className = "content";
        outputElement.setAttribute("style", OUTPUT_ELEMENT_STYLE_OLD);

        // Create li.watch-meta-item > h4.title:

        var titleElement = document.createElement("h4");
        titleElement.setAttribute("class", "title");
        titleElement.innerText = "Tags";

        // Create li.watch-meta-item:

        var tagsElement = document.createElement("li");
        tagsElement.className = "watch-meta-item yt-uix-expander-body";
        tagsElement.appendChild(titleElement);
        tagsElement.appendChild(outputElement);
        
        containerElement.appendChild(tagsElement);

        return outputElement;
    }

    /**
     * Collapses the output element for the material design layout, if the YouTube™ UI allows it.
     */
    function tryCollapseMaterialOutputElement(outputElement) {

        outputElement.style.display = "none";

        // If a video has no metadata, its expand/collapse buttons are hidden, which would
        // obviously prevent the user from viewing the tags that were just collapsed.
        // 
        // Unfortunately, this only becomes apparent/definitive once the YouTube™ UI is fully
        // loaded up. Which isn't necessarily the case when this function runs. So the check
        // below is set with a timeout. And repeated a few times for good measure.
        
        function fixForDisabledButtons() {
            var showMoreButton = document.querySelector(MATERIAL_MORE_BUTTON_SELECTOR);
            if (showMoreButton.getAttribute("hidden") !== null) {
                outputElement.style.display = "block";
            }
        }

        setTimeout(fixForDisabledButtons, 500);
        setTimeout(fixForDisabledButtons, 1000);
        setTimeout(fixForDisabledButtons, 3000);
    }

    setInterval(update, UPDATE_INTERVAL);

}());