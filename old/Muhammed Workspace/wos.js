const CATEGORY = document.title
const IMAGE_SIZE = 60;


var parentDiv = d3.select("#fullpage").node();
parWidth = parentDiv.getBoundingClientRect().width;
parHeight = parentDiv.getBoundingClientRect().height/2;


var svg = d3.select("#web")
        .attr("width",parWidth)
        .attr("height",parHeight)

    width = parWidth
    height = parHeight
    simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
        .id(function (d) {
            return d.name;
        })
        .distance(25)
        .strength(1))
    .force("collide", d3.forceCollide(50))
    .force("charge", d3.forceManyBody()
        .strength(1))
    .force("center", d3.forceCenter(width / 2, height /2))

d3.json("wos.json", function (data) {


    node_data = data.nodes.shared.concat(data.nodes[CATEGORY]);
    
    link_data = data.links[CATEGORY];

    /* graph links */
    var link = svg.append("g")
        .attr("class", "link")
        .selectAll("line")
        .data(link_data)
        .enter().append("line")
        .attr("stroke", "#5B5052");

    
    /* used for tracing to soil */
    function highlight(src, dest) {
        //initialize queue with source
        var queue = [];
        queue.push(src);

        //stores path
        var path = [];
        path.push(src);

        while (queue.length != 0) {
            var visited = new Set();
            var curr = queue.shift();
            //check if dest contains it
            if (curr.name == dest.name) {
                return path;
            }

            link_data.forEach(function (l) {
                if (l.target == curr) {
                    if (!visited.has(l.source)) {
                        //add to path
                        visited.add(l.source);
                        path.push(l.source);
                        //add to queue
                        queue.push(l.source);

                    }
                }
            })
        }
    }
    /* add circles */
    var nodes = svg.selectAll("g.nodes")
        .data(node_data, function(d) { return d.name; })
        .enter()
        .append("g")
        //highlight nodes on mouseover
        .on("mouseenter", (d) => {
            var path = highlight(d,node_data[0]);
            link
                .attr("stroke-width", function(l){
                    if (path.includes(l.target))
                        return 2;
                    else
                        return 1;
                });
        })
        .on("mouseleave", (d) => {
            link.attr("stroke-width", 1);
        })

        
    /* add images */
    var images = nodes.append("image")
        .attr("class", "image")
        .attr("xlink:href", function (d) {
            return d.img;
        })
        .attr("x", function (d) {
            return -(IMAGE_SIZE/2);
        })
        .attr("y", function (d) {
            return -(IMAGE_SIZE/2);
        })
        .attr("height", IMAGE_SIZE)
        .attr("width", IMAGE_SIZE)
        .on("mouseenter", function(d) {
            //change the display text to image name 
            d3.select("#name")
            .text(d.name);
        //expand on hover
            d3.select(this)
                .transition()
                .attr("x", function(d) { return -(IMAGE_SIZE * .75);})
                .attr("y", function(d) { return -(IMAGE_SIZE * .75);})
                .attr("height", IMAGE_SIZE * 1.5)
                .attr("width", IMAGE_SIZE * 1.5);
        })
        .on("mouseleave", function(d) {
            //change display text back
            d3.select("#name")
            .text(document.title);
            //undo expansion
            d3.select(this)
                .transition()
                .attr("x", function(d) { return -(IMAGE_SIZE/2);})
                .attr("y", function(d) { return -(IMAGE_SIZE/2);})
                .attr("height", IMAGE_SIZE)
                .attr("width", IMAGE_SIZE);
        })
        .on("click", function(d) {
            var path = highlight(d,node_data[0]);
            displayModal(path);
            var modal = document.getElementById('modal');
            modal.style.display = "block";        
        })
        .call(d3.drag()
        .on("start", start)
        .on("drag", drag)
        .on("end", end));


    simulation.nodes(node_data)
        .on("tick", update);

    simulation.force("link").links(link_data);

    var buttons = d3.select(".filters").selectAll('div > button');
    buttons.
        on("click", function() {
            let category = d3.select(this).attr('id');
            //FILTER BY BUTTON
            //filter non food nodes
            node_data = node_data.filter((n) => n.category == category || n.name == "Soil");

            nodes.data(node_data, function(d) { return d.name; })
                .exit().remove();
            
            //filter non food links
            link_data = link_data.filter((l) => {
                return node_data.includes(l.target) && node_data.includes(l.source);
            })

            link.data(link_data)
                .exit().remove();

            //restart simulation
            simulation.nodes(node_data)
                .on("tick", update);

            simulation.force("link").links(link_data);

            simulation.alpha(0.1).alphaTarget(.1).restart();
        })

    function start(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        // d.fx = d.x;
        // d.fy = d.y;
        }
        
    function drag(d) {
        d.x = d3.event.x;
        d.y = d3.event.y;
        console.log("x: ", d.x, "event: ", d3.event.x);
        }
        
    function end(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        // d.fx = null;
        // d.fy = null;
        }

    function update(d) {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            })

        nodes.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }

    function displayModal(path) {
        var row = document.getElementById("modal_row");
        path.forEach((item) => {
            var block = document.createElement("div");
            block.className = `modalTableCell-${CATEGORY}`;
            block.innerHTML = `<figure>
            <img src="${item.img}" style="width:100px" alt='missing' />
                <br>
                <h3>${item.name}</h3>
                <p align="left">${item.description}</p>
            </figure>
            `
            row.appendChild(block);
        });
        
    }
    /* MODAL DISPLAY */

    // Get the <span> element that closes the modal
    var span = d3.select(".close")
        .on("click", closeModal);

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    function closeModal() {
        // Get the modal
        var modal = document.getElementById('modal');
        modal.style.display = "none";
        var row = document.getElementById("modal_row");
        row.innerHTML = "";
    }

})
