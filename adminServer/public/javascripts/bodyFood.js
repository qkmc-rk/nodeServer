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
        xhr.open("GET","/getAllFoods",true);
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4){
                if(xhr.status==200){
                    var arr = JSON.parse(xhr.responseText);
                    document.getElementById('name').innerText = arr[0].name;
                    document.getElementById('price').innerText = "RMB"+arr[0].price;
                    // document.getElementById('tel').innerText = arr[0].tel;
                    document.getElementById('pl').innerText = arr[0].pl;
                    document.getElementById('sm').innerText = arr[0].sm;
                    document.getElementById('foodhot').innerText = arr[0].sm;
                    document.getElementById('imageindex').setAttribute('src',arr[0].imageindex);
                    var b = document.getElementsByClassName('btnBox_right')[0];
                    b.setAttribute('id',arr[0].id);
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
        xhr.open("POST","/getFoodSolo",true);
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4){
                if(xhr.status==200){
                    var arr = JSON.parse(xhr.responseText);
                    document.getElementById('name').innerText = arr[0].name;
                    document.getElementById('price').innerText = "RMB"+arr[0].price;
                    // document.getElementById('tel').innerText = arr[0].tel;
                    document.getElementById('pl').innerText = arr[0].pl;
                    document.getElementById('sm').innerText = arr[0].sm;
                    document.getElementById('foodhot').innerText = arr[0].sm;
                    document.getElementById('imageindex').setAttribute('src',arr[0].imageindex);
                    var b = document.getElementsByClassName('btnBox_right')[0];
                    b.setAttribute('id',arr[0].id);
                    document.getElementsByClassName('roomList')[0].style.display = "none";
                }
            }
        };
        xhr.send(id);
}
function buyBtn(e){
    var id = e.id;
    localStorage.setItem('buyId',id);    
}
window.onload = function(){
    getAllRooms();
}