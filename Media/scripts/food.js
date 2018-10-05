d3.csv('/Media/MediaHub3.csv', function(error, data) {
    if (error) throw error;

    var a = [];

    data.forEach(function (row, i){

        a.push(row.Category);
    });

    var unique = a.filter(function(item, i, ar){ return ar.indexOf(item) === i; });

    var tags = ['Food','Filter','Foundations','Fiber','Fun', 'Farmaceuticals'];
    console.log(tags);


        var section = document.getElementById("contain");

        var title = document.createElement('h1');
        title.className = "title";
        title.innerHTML = tags[0];

        var row = document.createElement('div')
        row.className = "row";

        var row_inner = document.createElement('div')
        row_inner.className = "row__inner";

        row.appendChild(row_inner);
        section.appendChild(title);

        data.forEach(function (row, i){

            if(row.Tags.includes(tags[0])) {
                    var url = row.URL;
                    var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
                    
                    var tile = document.createElement('div')
                    tile.className = "tile";
                    
                    var link = document.createElement('a');
                    d3.select(link)
                        .attr('data-fancybox', '')
                        .attr('data-small-btn', 'true')
                        .attr('href', row.URL);
                    tile.appendChild(link);

                    var tile_media = document.createElement('div')
                    tile_media.className = "tile__media";
                    
                    link.appendChild(tile_media);
                    
                    var image = document.createElement('img')
                    image.className = "tile__img"
                    if(videoid != null) {
                       var vimeoURL = row.URL;
                       var vimeoID = vimeoURL.substr(17);
                       image.src = "https://img.youtube.com/vi/" + videoid[1]+ "/0.jpg";
                    } else { 
                        image.src = './Media/img/0.jpg';
                    } 

                    link.appendChild(image);

                    var tile_details = document.createElement('div')
                    tile_details.className ="tile__details";
                    
                    var tile_title = document.createElement('div')
                    tile_title.className = "tile__title";
                    tile_title.innerHTML = row.Title;
                    tile_details.appendChild(tile_title);
                    
                    link.appendChild(tile_details);
                    
                    row_inner.appendChild(tile);
                
            }// row category is j 

        }); //data for each 
        section.appendChild(row);

}); //d3 