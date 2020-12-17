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
	var spacing = "15"
	var sniper_bar = document.createElement("DIV")
	sniper_bar.id = "sniper_bar"
	sniper_bar.style.padding = "5px";sniper_bar.style.width="100%";sniper_bar.style.position="fixed";sniper_bar.style.backgroundColor="black";sniper_bar.style.top="0px";sniper_bar.style.left="0px";sniper_bar.style.zIndex="10000";
	

	var elem_data = {"COPY ID":["sniper_e_id","sniper_l_id"],"COPY CLASS":["sniper_e_class","sniper_l_class"],"COPY FULL XPATH":["sniper_e_fxpath","sniper_l_fxpath"],"COPY UNIQUE XPATH":["sniper_e_uxpath","sniper_l_uxpath"]}
	var elem1 = null

	for(var elemText in elem_data){
		var elemData = elem_data[elemText]
		elem1 = document.createElement("BUTTON")
		elem1.style.display="inline-block";elem1.innerHTML=elemText;elem1.id=elemData[1];elem1.style.backgroundColor="#27ae60";elem1.style.color="white"
        elem1.dataset.id = elemData[0]
		elem1.onclick = function(){
            console.log()
			document.getElementById(this.dataset.id).focus()
			document.getElementById(this.dataset.id).select()
			document.execCommand("copy")
		}
		sniper_bar.appendChild(elem1)
		elem1 = document.createElement("INPUT")
		elem1.id=elemData[0]
		elem1.type="text"
		elem1.style.marginRight=spacing+"px"
		sniper_bar.appendChild(elem1)
	}

	elem1 = document.createElement("BR")
	sniper_bar.appendChild(elem1)

	elem1 = document.createElement("BUTTON")
	elem1.innerHTML="CLOSE"
	elem1.onclick = function(){
		document.getElementById("sniper_bar").remove()
	}
	sniper_bar.appendChild(elem1)


	document.body.appendChild(sniper_bar)

	document.getElementById("sniper_e_class").value = element.classList
	document.getElementById("sniper_e_id").value = element.id
	document.getElementById("sniper_e_fxpath").value = Elements.DOMPath.xPath(element,false)
	document.getElementById("sniper_e_uxpath").value = Elements.DOMPath.xPath(element,true)

	for(var elemText in elem_data){
		document.getElementById(elem_data[elemText][0]).style.width = document.getElementById(elem_data[elemText][0]).value.length + 'ch'
		if(document.getElementById(elem_data[elemText][0]).value.trim()==""){
			document.getElementById(elem_data[elemText][1]).remove()
			document.getElementById(elem_data[elemText][0]).remove()
		}
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