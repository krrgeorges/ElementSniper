Elements = {};
Elements.DOMPath = {};

Elements.DOMPath.xPath = function (node, optimized) {
    if (node.nodeType === Node.DOCUMENT_NODE) {
        return '/';
    }

    const steps = [];
    let contextNode = node;
    while (contextNode) {
        const step = Elements.DOMPath._xPathValue(contextNode, optimized);
        if (!step) {
            break;
        }  // Error - bail out early.
        steps.push(step);
        if (step.optimized) {
            break;
        }
        contextNode = contextNode.parentNode;
    }

    steps.reverse();
    return (steps.length && steps[0].optimized ? '' : '/') + steps.join('/');
};

Elements.DOMPath._xPathValue = function (node, optimized) {
    let ownValue;
    const ownIndex = Elements.DOMPath._xPathIndex(node);
    if (ownIndex === -1) {
        return null;
    }  // Error.

    switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            if (optimized && node.getAttribute('id')) {
                return new Elements.DOMPath.Step('//*[@id="' + node.getAttribute('id') + '"]', true);
            }
            ownValue = node.localName;
            break;
        case Node.ATTRIBUTE_NODE:
            ownValue = '@' + node.nodeName;
            break;
        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
            ownValue = 'text()';
            break;
        case Node.PROCESSING_INSTRUCTION_NODE:
            ownValue = 'processing-instruction()';
            break;
        case Node.COMMENT_NODE:
            ownValue = 'comment()';
            break;
        case Node.DOCUMENT_NODE:
            ownValue = '';
            break;
        default:
            ownValue = '';
            break;
    }

    if (ownIndex > 0) {
        ownValue += '[' + ownIndex + ']';
    }

    return new Elements.DOMPath.Step(ownValue, node.nodeType === Node.DOCUMENT_NODE);
};
Elements.DOMPath._xPathIndex = function (node) {
    function areNodesSimilar(left, right) {
        if (left === right) {
            return true;
        }

        if (left.nodeType === Node.ELEMENT_NODE && right.nodeType === Node.ELEMENT_NODE) {
            return left.localName === right.localName;
        }

        if (left.nodeType === right.nodeType) {
            return true;
        }

        // XPath treats CDATA as text nodes.
        const leftType = left.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : left.nodeType;
        const rightType = right.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : right.nodeType;
        return leftType === rightType;
    }

    const siblings = node.parentNode ? node.parentNode.children : null;
    if (!siblings) {
        return 0;
    }  // Root node - no siblings.
    let hasSameNamedElements;
    for (let i = 0; i < siblings.length; ++i) {
        if (areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
            hasSameNamedElements = true;
            break;
        }
    }
    if (!hasSameNamedElements) {
        return 0;
    }
    let ownIndex = 1;  // XPath indices start with 1.
    for (let i = 0; i < siblings.length; ++i) {
        if (areNodesSimilar(node, siblings[i])) {
            if (siblings[i] === node) {
                return ownIndex;
            }
            ++ownIndex;
        }
    }
    return -1;  // An error occurred: |node| not found in parent's children.
};

Elements.DOMPath.Step = class {
   	constructor(value, optimized) {
        this.value = value;
        this.optimized = optimized || false;
    }
    toString() {
        return this.value;
    }
};



var lastColor = ""
var lastElementActedUpon = null
var lastECEvent = null

chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
	if(msg.action == "snipe"){
		if(document.getElementById("sniper_bar")!=undefined && document.getElementById("sniper_bar")!=null){
			document.getElementById("sniper_bar").remove()
		}
		console.log("Sniping...")
		document.body.style.cursor = 'crosshair'
		document.onmousemove = function(e){snipeOnElement(e);}
	}
})

function snipeOnElement(e){
	var element = document.elementFromPoint(e.x,e.y)
	if(lastElementActedUpon!=null && lastElementActedUpon!=element){
		lastElementActedUpon.style.backgroundColor = lastColor
		lastElementActedUpon.onclick = lastECEvent
	}
	if(element!=null && element.style.backgroundColor!="#2ecc7166" && element.style.backgroundColor!="rgba(46, 204, 113, 0.4)"){
		lastColor = element.style.backgroundColor
		element.style.backgroundColor="#2ecc7166"
		lastElementActedUpon = element
		lastECEvent = element.onclick
		element.onclick = function(e){
			e.preventDefault()
			displayElementDetails(element);
			endSnipe()
		}
	}
}

function displayElementDetails(element){
	console.log(element)
	var blank = document.createTextNode("\u00A0\u00A0\u00A0\u00A0")
	var spacing = "15"
	var bar = '<div id="sniper_bar" style="padding:5px;width:100%!important;position:fixed;background-color:black;top:0px;left:0px;z-index:100;white-space:nowrap;"></div>'
	var sniper_bar = document.createElement("DIV")
	sniper_bar.id = "sniper_bar"
	sniper_bar.style.padding = "5px";sniper_bar.style.width="100%";sniper_bar.style.position="fixed";sniper_bar.style.backgroundColor="black";sniper_bar.style.top="0px";sniper_bar.style.left="0px";sniper_bar.style.zIndex="100";sniper_bar.style.whiteSpace="nowrap";
	
	var elem1 = document.createElement("BUTTON")
	elem1.style.display="inline-block";elem1.innerHTML="COPY ID";elem1.id="sniper_l_id";elem1.style.backgroundColor="#27ae60";elem1.style.color="white"
	elem1.onclick = function(){
		document.getElementById("sniper_e_id").focus()
		document.getElementById("sniper_e_id").select()
		document.execCommand("copy")
	}
	sniper_bar.appendChild(elem1)
	var elem2 = document.createElement("INPUT")
	elem2.id="sniper_e_id"
	elem2.type="text"
	elem2.style.marginRight=spacing+"px"
	sniper_bar.appendChild(elem2)

	var elem1 = document.createElement("BUTTON")
	elem1.style.display="inline-block";elem1.innerHTML="COPY CLASS";elem1.id="sniper_l_class";elem1.style.backgroundColor="#27ae60";elem1.style.color="white"
	elem1.onclick = function(){
		document.getElementById("sniper_e_class").focus()
		document.getElementById("sniper_e_class").select()
		document.execCommand("copy")
	}
	sniper_bar.appendChild(elem1)
	var elem2 = document.createElement("INPUT")
	elem2.id="sniper_e_class"
	elem2.type="text"
	elem2.style.marginRight=spacing+"px"
	sniper_bar.appendChild(elem2)


	var elem1 = document.createElement("BUTTON")
	elem1.style.display="inline-block";elem1.innerHTML="COPY FULL XPATH";elem1.id="sniper_l_fxpath";elem1.style.backgroundColor="#27ae60";elem1.style.color="white"
	elem1.onclick = function(){
		document.getElementById("sniper_e_fxpath").focus()
		document.getElementById("sniper_e_fxpath").select()
		document.execCommand("copy")
	}
	sniper_bar.appendChild(elem1)
	var elem2 = document.createElement("INPUT")
	elem2.id="sniper_e_fxpath"
	elem2.type="text"
	elem2.style.marginRight=spacing+"px"
	sniper_bar.appendChild(elem2)

	var elem1 = document.createElement("BUTTON")
	elem1.style.display="inline-block";elem1.innerHTML="COPY UNIQUE XPATH";elem1.id="sniper_l_uxpath";elem1.style.backgroundColor="#27ae60";elem1.style.color="white"
	sniper_bar.appendChild(elem1)
	elem1.onclick = function(){
		document.getElementById("sniper_e_uxpath").focus()
		document.getElementById("sniper_e_uxpath").select()
		document.execCommand("copy")
	}
	var elem2 = document.createElement("INPUT")
	elem2.id="sniper_e_uxpath"
	elem2.type="text"
	elem2.style.marginRight=spacing+"px"
	sniper_bar.appendChild(elem2)



	var elem1 = document.createElement("BR")
	sniper_bar.appendChild(elem1)

	var elem1 = document.createElement("BUTTON")
	elem1.innerHTML="CLOSE"
	elem1.onclick = function(){
		document.getElementById("sniper_bar").remove()
	}
	sniper_bar.appendChild(elem1)


	document.body.appendChild(sniper_bar)
	document.getElementById("sniper_e_class").value = element.classList
	document.getElementById("sniper_e_class").style.width = document.getElementById("sniper_e_class").value.length + 'ch'
	document.getElementById("sniper_e_id").value = element.id
	document.getElementById("sniper_e_id").style.width = document.getElementById("sniper_e_id").value.length + 'ch'
	document.getElementById("sniper_e_fxpath").value = Elements.DOMPath.xPath(element,false)
	document.getElementById("sniper_e_fxpath").style.width = document.getElementById("sniper_e_fxpath").value.length + 'ch'
	document.getElementById("sniper_e_uxpath").value = Elements.DOMPath.xPath(element,true)
	document.getElementById("sniper_e_uxpath").style.width = document.getElementById("sniper_e_uxpath").value.length + 'ch'

	if(document.getElementById("sniper_e_class").value.trim()==""){
		document.getElementById("sniper_l_class").remove()
		document.getElementById("sniper_e_class").remove()
	}
	if(document.getElementById("sniper_e_id").value.trim()==""){
		document.getElementById("sniper_l_id").remove()
		document.getElementById("sniper_e_id").remove()
	}
	if(document.getElementById("sniper_e_fxpath").value.trim()==""){
		document.getElementById("sniper_l_fxpath").remove()
		document.getElementById("sniper_e_fxpath").remove()
	}
	if(document.getElementById("sniper_e_uxpath").value.trim()==""){
		document.getElementById("sniper_l_uxpath").remove()
		document.getElementById("sniper_e_uxpath").remove()
	}







}

function endSnipe(){
	if(lastElementActedUpon!=null){
		lastElementActedUpon.style.backgroundColor = lastColor
		lastElementActedUpon.onclick = lastECEvent	
	}
	document.body.style.cursor = 'default'
	document.onmousemove = function(){}
}