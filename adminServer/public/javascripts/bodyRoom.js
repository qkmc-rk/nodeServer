var show = false;
function showBar(){
    console.log(show);
    if(show){
        document.getElementsByClassName('roomList')[0].style.display = "none";
        show = false;
    }else{
        document.getElementsByClassName('roomList')[0].style.display = "block";
        show = true;
    }
}
function getAllRooms(){
    var xhr=new XMLHttpRequest();
        xhr.open("GET","/getAllRooms",true);
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4){
                if(xhr.status==200){
                    var arr = JSON.parse(xhr.responseText);
                    document.getElementById('name').innerText = arr[0].name;
                    document.getElementById('location').innerText = arr[0].location;
                    document.getElementById('tel').innerText = arr[0].tel;
                    document.getElementById('content').innerText = arr[0].content;
                    document.getElementById('coverindex').setAttribute('src',arr[0].coverindex);
                    document.getElementById('carIndex1').setAttribute('src',arr[0].carIndex1);
                    document.getElementById('carIndex2').setAttribute('src',arr[0].carIndex2);
                    document.getElementById('carIndex3').setAttribute('src',arr[0].carIndex3);
                    for(var i=1;i<arr.length;i++){
                        var li = document.createElement('li');
                        li.setAttribute('id',arr[i].id);
                        var liText = document.createTextNode(arr[i].name);
                        li.appendChild(liText);
                        li.onclick = function(){
                            getDataSolo(this.id);
                        }
                        document.getElementsByClassName('roomList')[0].appendChild(li);
                    }
                }
            }
        };
        xhr.send();
}
function getDataSolo(id){
    var xhr=new XMLHttpRequest();
        xhr.open("POST","/getRoomSolo",true);
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4){
                if(xhr.status==200){
                    var arr = JSON.parse(xhr.responseText);
                    document.getElementById('name').innerText = arr[0].name;
                    document.getElementById('location').innerText = arr[0].location;
                    document.getElementById('tel').innerText = arr[0].tel;
                    document.getElementById('content').innerText = arr[0].content;
                    document.getElementById('coverindex').setAttribute('src',arr[0].coverindex);
                    document.getElementById('carIndex1').setAttribute('src',arr[0].carIndex1);
                    document.getElementById('carIndex2').setAttribute('src',arr[0].carIndex2);
                    document.getElementById('carIndex3').setAttribute('src',arr[0].carIndex3);
                    document.getElementsByClassName('roomList')[0].style.display = "none";
                }
            }
        };
        xhr.send(id);
}
window.onload = function(){
    getAllRooms();
}