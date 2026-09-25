(function ($) {
    if (!document.getElementById('env-app')) return;
    window.$ = window.$ || $;
    var s = document.createElement('script');
    s.src = 'https://www.govmap.gov.il/govmap/api/govmap.api.js';
    s.onload = function () {
        govmap.createMap('map', {
            token: '21319be6-2280-46f3-8a46-1f4439416985',
            layers: ["parcel_all"],
            showXY: true,
            identifyOnClick: true,
            isEmbeddedToggle: false,
            background: 3,
            layersMode: 1,
            zoomButtons: false
        });
    };
    document.head.appendChild(s);
    var _geoKey = null, _geoPromise = null;
    function geocodeOnce(opts) {
        if (_geoKey !== opts.keyword) {
            _geoKey = opts.keyword;
            _geoPromise = govmap.geocode(opts);
        }
        return _geoPromise;
    }
        function clearFields(inputType) {
            if (inputType === "address") {
                document.getElementById('lot').value = "";
                document.getElementById('parcel').value = "";
            } else {
                document.getElementById('street').value = "";
                document.getElementById('number').value = "";
                document.getElementById('city').value = "";
            }
        }
        function showExample() {
            _geoKey = null;
            document.getElementById('loading').style.display = 'block'; // Show loading spinner
            $('#env-app table').remove();
            $('#env-app h2').remove();
            $('#noClinicsMessage').remove(); // Remove the previous no clinics message if it exists
            var inputType = $("input[name='inputType']:checked").val();
            clearFields(inputType);
var firstAddress;
var points = [];
if (inputType === "address") {
    var street = document.getElementById('street').value.trim();
    var number = document.getElementById('number').value.trim();
    var city = document.getElementById('city').value.trim();
    firstAddress = street + "," + number + "," + city;
  } else {
    var lot = document.getElementById('lot').value.trim();
    var parcel = document.getElementById('parcel').value.trim();
    firstAddress = " גוש " + lot + " חלקה " + parcel;
    // בדיקה אם lot ו-parcel הם מספרים בני 6 ספרות
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
        points.push({ x: parseInt(lot), y: parseInt(parcel) });
    }
}
geocodeOnce({ keyword: firstAddress, type: govmap.geocodeType.AccuracyOnly }).then(function (response) {
    // אם עדיין אין נקודות, ננסה להוסיף מהתוצאה
    if (points.length === 0) {
        $.each(response.data, function (index, obj) {
            points.push({ x: obj.X, y: obj.Y });
            var url = 'https://www.govmap.gov.il/?c=' + obj.X + ',' + obj.Y + '&z=8&b=NaN&lay=PARCEL_ALL&q=' + encodeURIComponent(firstAddress);
            // window.open(url, '_blank');
        });
    }
    if (points.length === 0) {
        alert("לא נמצאו כתובת או זיהוי רלוונטי");
        document.getElementById('loading').style.display = 'none'; 
        return;
    }
    if (points.length > 1) {
        alert("במיקום שהוזן רשומות מס' כתובות. אנא נסה שוב עם כתובת מדויקת יותר או באמצעות גוש וחלקה.");
        document.getElementById('loading').style.display = 'none';
        return;
    }
                var uniqueInstitutions = {};
                var radius = 3000;
                function searchClinics() {
                    $.each(points, function (index, point) {
                        var params = {
                            LayerName: '96',
                            Point: point,
                            Radius: radius
                        };
                        govmap.getLayerData(params).then(function (response) {
                            $.each(response.data, function (index, obj) {
                                var institutionType = obj.Fields[1].Value ;
                                var street = obj.Fields[2].Value ;
                                var roundedDistance = Math.round(obj.distance / 10) * 10;
                                if (street === "לא רלוונטי") {
                                    if (!uniqueInstitutions[institutionType] || uniqueInstitutions[institutionType].distance > roundedDistance) {
                                        uniqueInstitutions[institutionType] = {
                                            name: institutionType,
                                            street: street,
                                            number: obj.Fields[4].Value ,
                                            distance: roundedDistance
                                        };
                                    }
                                }
                            });
                            if ($.isEmptyObject(uniqueInstitutions) && radius === 3000) {
                                radius = 10000;
                                searchClinics();
                            } else if ($.isEmptyObject(uniqueInstitutions) && radius === 10000) {
                                var noClinicsMessage = $('<h2 id="noClinicsMessage" class="red-text"/>').text(' ');
                                $('#env-app').prepend(noClinicsMessage); // Add the no clinics message at the top of the page
                                document.getElementById('loading').style.display = 'none'; // Hide loading spinner
                            } else {
                                var title = $('<h2/>').text('מרכזי קופות חולים בסביבת הנכס');
                                $('#env-app').append(title);
                                var table = $('<table/>');
                                table.append('<tr><th>שם</th><th>כתובת</th><th>מרחק במטרים</th></tr>');
                                var rows = [];
                                $.each(uniqueInstitutions, function (index, obj) {
                                    rows.push($('<tr><td>' + obj.name + '</td><td>' + obj.number + '</td><td>' + obj.distance + '</td></tr>'));
                                });
                                rows.sort(function (a, b) {
                                    return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
                                });
                                for (var i = 0; i < Math.min(5, rows.length); i++) {
                                    table.append(rows[i]);
                                }
                                $('#env-app').append(table);
                                document.getElementById('loading').style.display = 'none'; // Hide loading spinner
                            }
                        }).catch(function () {
                            alert("אנא נסו יותר מאוחר");
                            document.getElementById('loading').style.display = 'none'; // Hide loading spinner
                        });
                    });
                }
   geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
   if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
        points.push({ x: parseInt(lot), y: parseInt(parcel) });
    }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '350',
        Point: point,
        Radius:500
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          rows.push($('<tr><td>' + obj.Fields[3].Value  + '</td><td>' + obj.Fields[5].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('גידולים חקלאיים בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>מועצה</th><th>סוג גידול </th><th>מרחק במטרים</th></tr>');
          for (var i = 0; i < Math.min(2, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
   geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '288',
        Point: point,
        Radius:1000
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 1) * 1;
          rows.push($('<tr><td>' + obj.Fields[4].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('אתרי אסבסט בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>סוג אתר</th><th>מרחק במטרים</th></tr>');
          for (var i = 0; i < Math.min(2, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
   geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '19',
        Point: point,
        Radius:2000
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          rows.push($('<tr><td>' + obj.Fields[0].Value  + '</td><td>' + obj.Fields[2].Value  + '</td><td>' + obj.Fields[6].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('אטרקציות בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>שם אתר</th><th>כתובת</th><th>סוג אטרקציה</th><th>מרחק במטרים</th></tr>');
          for (var i = 0; i < Math.min(2, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '240756',
        Point: point,
        Radius:2000
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          rows.push($('<tr><td>' + obj.Fields[1].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('תחנות  רכבת בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>שם תחנה</th><th>מרחק במטרים</th></tr>');
          for (var i = 0; i < Math.min(1, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
  geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
 if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
        points.push({ x: parseInt(lot), y: parseInt(parcel) });
    }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '20',
        Point: point,
        Radius:500
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
         rows.push($('<tr><td>' + obj.Fields[2].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('תחנות אוטובוס בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
        table.append('<tr><th>שם</th><th>מרחק במטרים</th></tr>'); 
          for (var i = 0; i < Math.min(3, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
 geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
 if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
        points.push({ x: parseInt(lot), y: parseInt(parcel) });
    }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '149',
        Point: point,
        Radius:1000
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          rows.push($('<tr><td>' + obj.Fields[0].Value  + '</td><td>' + obj.Fields[1].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('תחנות  רכבת קלה בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>שם קו</th><th>שם תחנה</th><th>מרחק במטרים</th></tr>');
          for (var i = 0; i < Math.min(2, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
 geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '151',
        Point: point,
        Radius:1000
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          rows.push($('<tr><td>' + obj.Fields[0].Value  + '</td><td>' + obj.Fields[1].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('תחנות  מטרו בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>שם קו</th><th>שם תחנה</th><th>מרחק במטרים</th></tr>');
          for (var i = 0; i < Math.min(2, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
 geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '53',
        Point: point,
        Radius:100
      };
        govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          var flowAxisName = obj.Fields[0].Value  ? obj.Fields[0].Value  : "זרימה עונתית ";
          var drainType = obj.Fields[2].Value  ? obj.Fields[2].Value  : " לא ידוע";
          rows.push($('<tr><td>' + flowAxisName + '</td><td>' + drainType + '</td><td>' + 'בסמיכות' + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('נחלים ותעלות  בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>שם ציר זרימה</th><th>סוג מידרג  </th><th>מרחק </th></tr>');
          for (var i = 0; i < Math.min(1, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
  geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '400',
        Point: point,
        Radius:1000
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        var minDistances = {};
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          var facilityType = obj.Fields[3].Value .split("–")[0];
          facilityType = facilityType.split("(")[0];
          if (!minDistances[facilityType] || minDistances[facilityType] > roundedDistance) {
            minDistances[facilityType] = roundedDistance;
            rows.push($('<tr><td>' + obj.Fields[0].Value  + '</td><td>' + obj.Fields[9].Value  + '</td><td>' + obj.Fields[2].Value  + '</td><td>' + facilityType + '</td><td>' + roundedDistance + '</td></tr>'));
          }
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // Display only the first 3 results
        for (var i = 0; i < 3; i++) {
          if (rows[i]) {
            if (i == 0) {
              var title = $('<h2/>').text('מתקני ספורט ציבוריים בסביבת הנכס');
              $('#env-app').append(title);
              var table = $('<table/>');
              table.append('<tr><th>רשות</th><th>רחוב</th><th>שם</th><th>סוג המתקן</th><th>מרחק</th></tr>');
              $('#env-app').append(table);
            }
            table.append(rows[i]);
          }
        }
      });
    });
  });
geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}).then(function(response){
  var points = [];
  $.each(response.data, function(index, obj) {
    points.push({x: obj.X, y: obj.Y});
  });
  if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
  $.each(points, function(index, point) {
    var params = {
      LayerName: '182',
      Point: point,
      Radius:1000
    };
    govmap.getLayerData(params).then(function(response){
      var distances = new Map();
      $.each(response.data, function(index, obj) {
        var roundedDistance = Math.round(obj.distance / 10) * 10;
        var type = obj.Fields[5].Value ;
        if(distances.has(type)) {
          var currentDistance = distances.get(type);
          if(roundedDistance < currentDistance) {
            distances.set(type, roundedDistance);
          }
        } else {
          distances.set(type, roundedDistance);
        }
      });
      // המר את המפה למערך של אובייקטים
      var distancesArray = Array.from(distances, ([type, distance]) => ({type, distance}));
      // מיין את המערך לפי המרחקים
      distancesArray.sort(function(a, b) {
        return a.distance - b.distance;
      });
      // בדוק אם יש נתונים להציג
      if (distancesArray.length > 0) {
        var title = $('<h2/>').text('אתרי עתיקות בסביבת הנכס');
        $('#env-app').append(title);
        var table = $('<table/>');
        table.append('<tr><th>סוג העתיקות</th><th>מרחק במטרים</th></tr>');
        // הוסף לטבלה רק את ה-5 הראשונים
        for (var i = 0; i < Math.min(3, distancesArray.length); i++) {
          var type = distancesArray[i].type;
          var distance = distancesArray[i].distance;
          table.append('<tr><td>' + type + '</td><td>' + distance + '</td></tr>');
        }
        $('#env-app').append(table);
      } else {
        var message = $('<h2 class="green-text"/>').text(' ');
        $('#env-app').append(message);
      }
    });
  });
});
function getGasStations(radius) {
  geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '228305',
        Point: point,
        Radius: radius
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          // עגל את המרחק לפי עשרות
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          rows.push($('<tr><td>' + obj.Fields[0].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // בדוק אם יש נתונים להציג
        if (rows.length > 0) {
          var title = $('<h2/>').text('תחנות דלק בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>תחנה</th><th>מרחק במטרים</th></tr>');
          // הוסף רק את חמשת השורות הראשונות לטבלה
          for (var i = 0; i < Math.min(2, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        } else if (radius < 20000) {
          // אם לא מצאנו תחנות דלק, נרחיב את הרדיוס ל-20000 מטרים וננסה שוב
          getGasStations(20000);
        } else {
          var message = $('<h2/>').text(' ');
          $('#env-app').append(message);
        }
      });
    });
  });
}
getGasStations(1000);
  geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '233969',
        Point: point,
        Radius:1000
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          rows.push($('<tr><td>' + obj.Fields[1].Value  + '</td><td>' + obj.Fields[3].Value  + '</td><td>' + obj.Fields[4].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        if (rows.length > 0) {
          var title = $('<h2/>').text('אנטנות סלולאריות בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          table.append('<tr><th>שם חברה</th><th>רשות</th><th>כתובת</th><th>מרחק במטרים</th></tr>');
          for (var i = 0; i < Math.min(3, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        } else {
          var message = $('<h2 class="green-text"/>').text(' ');
          $('#env-app').append(message);
        }
      });
    });
  });
geocodeOnce({ keyword: firstAddress, type: govmap.geocodeType.AccuracyOnly })
  .then(function(response) {
    const points = [];
    if (Array.isArray(response.data)) {
      response.data.forEach(obj => {
        points.push({ x: obj.X, y: obj.Y });
      });
    }
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
      points.push({ x: parseInt(lot), y: parseInt(parcel) });
    }
    const excludedKeywords = ['לאומית', 'כללית', 'מאוחדת', 'מכבי'];
    const uniqueInstitutions = {};
    points.forEach(point => {
      const params = {
        LayerName: '330',
        Point: point,
        Radius: 1000
      };
      govmap.getLayerData(params).then(function(response) {
        response.data.forEach(obj => {
          const institutionType = obj.Fields[1].Value;
          const roundedDistance = Math.round(obj.distance / 10) * 10;
          // סינון לפי מילות מפתח
          const isExcluded = excludedKeywords.some(keyword => institutionType.includes(keyword));
          if (isExcluded) return;
          if (!uniqueInstitutions[institutionType] || uniqueInstitutions[institutionType].distance > roundedDistance) {
            uniqueInstitutions[institutionType] = {
              name: institutionType,
              street: obj.Fields[7].Value,
              number: obj.Fields[8].Value,
              distance: roundedDistance
            };
          }
        });
        const rows = Object.values(uniqueInstitutions).map(obj => $('<tr>').append(
          `<td>${obj.name}</td><td>${obj.street}</td><td>${obj.number}</td><td>${obj.distance}</td>`
        ));
        if (rows.length > 0) {
          const title = $('<h2/>').text('שימושי ציבור בסביבת הנכס');
          $('#env-app').append(title);
          const table = $('<table/>').append('<tr><th>שם</th><th>רחוב</th><th>מספר</th><th>מרחק במטרים</th></tr>');
          rows.sort((a, b) => parseFloat(a.children().last().text()) - parseFloat(b.children().last().text()))
               .slice(0, 5)
               .forEach(row => table.append(row));
          $('#env-app').append(table);
        }
      });
    });
  });
geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '168',
        Point: point,
        Radius:5000
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          rows.push($('<tr><td>' + obj.Fields[1].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('תחנות משטרה בסביבת הנכס');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>כתובת</th><th>מרחק במטרים</th></tr>');
          for (var i = 0; i < Math.min(1, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
        points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
        var params = {
            LayerName: '200720',
            Point: point,
            Radius: 1000
        };
        govmap.getLayerData(params).then(function(response){
            var rows = [];
            $.each(response.data, function(index, obj) {
                var roundedDistance = Math.round(obj.distance / 10) * 10;
                // עיצוב התאריך בפורמט יום/חודש/שנה
                var dateValue = obj.Fields[9]?.Value || ""; // בדיקת ערך התאריך
                var formattedDate = "טרם אושר"
                if (dateValue) {
                    // במקרה שהתאריך כולל גם שעה (פורמט YYYY-MM-DD HH:MM:SS)
                    var dateParts = dateValue.split('T')[0].split('-'); // לקח רק את החלק לפני T ופצל לפי -
                  formattedDate = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0]; // 10/04/2011
                }
           // יצירת לינק לתוכנית או הצגת "אין מידע" אם אין קישור
      var planLink = obj.Fields[4]?.Value && obj.Fields[4].Value  !== "אין מידע" 
    ? '<a href="' + obj.Fields[4].Value  + '" target="_blank">קישור לתוכנית</a>' 
    : 'אין מידע';
                rows.push($('<tr><td>' + obj.Fields[0].Value  + '</td><td>' + obj.Fields[3].Value  + '</td><td>' + formattedDate + '</td><td>' + planLink + '</td><td>' + roundedDistance + '</td></tr>'));
            });
            rows.sort(function(a, b) {
                return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
            });
            if (rows.length > 0) {
                var title = $('<h2/>').text('מתחמי התחדשות עירונית בסביבת הנכס');
                $('#env-app').append(title);
                var table = $('<table/>');
                table.append('<tr><th>שם מתחם</th><th>מספר תוכנית</th><th>תאריך אישור תוכנית</th><th>קישור לתוכנית</th><th>מרחק במטרים</th></tr>');
                for (var i = 0; i < Math.min(2, rows.length); i++) {
                    table.append(rows[i]);
                }
                $('#env-app').append(table);
            }
        });
    });
});
geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
        points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
        var params = {
            LayerName: '282',
            Point: point,
            Radius: 1000
        };
        govmap.getLayerData(params).then(function(response){
            var rows = [];
            $.each(response.data, function(index, obj) {
                var roundedDistance = Math.round(obj.distance / 1) * 1;
                // Get pollution values from Fields
                var co = parseFloat(obj.Fields[1].Value );
                var nox = parseFloat(obj.Fields[2].Value ); // assuming fields[2] is NOX
                var nmvoc = parseFloat(obj.Fields[3].Value ); // assuming fields[3] is NMVOC
                var so2 = parseFloat(obj.Fields[4].Value ); // assuming fields[4] is SO2
                var ppm_fin = parseFloat(obj.Fields[5].Value ); // assuming fields[5] is PPM_FIN
                var benzen = parseFloat(obj.Fields[6].Value ); // assuming fields[6] is BENZEN
                // Adjust the coefficients to increase AQI values for higher pollution
                var a = 1, b = 1, c = 1, d = 1, e = 1, f = 1; // increased coefficients for higher AQI
                var aqi = a * co + b * nox + c * nmvoc + d * so2 + e * ppm_fin + f * benzen;
                var pollutionLevel;
                var cellStyle = '';
                // Determine pollution level and cell style based on AQI value
                if (nox <0.6) {
                    pollutionLevel = "זיהום נמוך";
                    cellStyle = 'style="color: green;"';
                } else if (nox >= 0.6 && nox < 2) {
                    pollutionLevel = "זיהום בינוני";
                    cellStyle = 'style="color: orange;"';
                } else if (nox >= 2) {
                    pollutionLevel = "זיהום גבוה";
                    cellStyle = 'style="color: red;"';
                } else {
                    pollutionLevel = "נתונים לא תקינים";
                }
                // Create table row with styled pollution level
                rows.push($('<tr><td ' + cellStyle + '>' + pollutionLevel + '</td><td>' + roundedDistance + '</td></tr>'));
            });
            rows.sort(function(a, b) {
                return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
            });
            if (rows.length > 0) {
                var title = $('<h2/>').text('פליטות מזהמים מכבישים בסביבת הנכס');
                $('#env-app').append(title);
                var table = $('<table/>');
                table.append('<tr><th>רמת זיהום</th><th>מרחק מנקודת מדידה במטרים</th></tr>');
                for (var i = 0; i < Math.min(2, rows.length); i++) {
                    table.append(rows[i]);
                }
                $('#env-app').append(table);
            }
        });
    });
});
geocodeOnce({keyword: (firstAddress), type: govmap.geocodeType.AccuracyOnly}
  ).then(function(response){
    var points = [];
    $.each(response.data, function(index, obj) {
      points.push({x: obj.X, y: obj.Y});
    });
    if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
    $.each(points, function(index, point) {
      var params = {
        LayerName: '218559',
        Point: point,
        Radius:500
      };
      govmap.getLayerData(params).then(function(response){
        var rows = [];
        $.each(response.data, function(index, obj) {
          var roundedDistance = Math.round(obj.distance / 10) * 10;
          rows.push($('<tr><td>' + obj.Fields[2].Value  + '</td><td>' + obj.Fields[4].Value  + '</td><td>' + obj.Fields[5].Value  + '</td> <td>' + roundedDistance + '</td></tr>'));
        });
        rows.sort(function(a, b) {
          return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
        });
        // הוסף רק את חמשת השורות הראשונות לטבלה
        if (rows.length > 0) {
          // הוסף כותרת לטבלה
          var title = $('<h2/>').text('אנטנות סלולאריות בהקמה');
          $('#env-app').append(title);
          var table = $('<table/>');
          // שנה את שמות העמודות
          table.append('<tr><th>שם חברה</th><th>רשות</th><th>כתובת</th><th>מרחק במטרים</th></tr>');
          for (var i = 0; i < Math.min(2, rows.length); i++) {
            table.append(rows[i]);
          }
          $('#env-app').append(table);
        }
      });
    });
  });
                geocodeOnce({keyword: firstAddress, type: govmap.geocodeType.AccuracyOnly}
                ).then(function (response) {
                    var points = [];
                    $.each(response.data, function (index, obj) {
                        points.push({x: obj.X, y: obj.Y});
                    });
                if (/^\d{6}$/.test(lot) && /^\d{6}$/.test(parcel)) {
                points.push({ x: parseInt(lot), y: parseInt(parcel) });
                }
                    $.each(points, function (index, point) {
                        var params = {
                            LayerName: '243000',
                            Point: point,
                            Radius: 1000
                        };
                        govmap.getLayerData(params).then(function (response) {
                            var rows = [];
                            $.each(response.data, function (index, obj) {
                                var roundedDistance = Math.round(obj.distance / 10) * 10;
                                rows.push($('<tr><td>' + obj.Fields[1].Value  + '</td><td>' + obj.Fields[2].Value  + '</td><td>' + obj.Fields[10].Value  + '</td><td>' + obj.Fields[11].Value  + '</td><td>' + roundedDistance + '</td></tr>'));
                            });
                            rows.sort(function (a, b) {
                                return parseFloat(a.children().last().text()) - parseFloat(b.children().last().text());
                            });
                            if (rows.length > 0) {
                                var title = $('<h2/>').text('אתרים מזוהמים בסביבת הנכס');
                                $('#env-app').append(title);
                                var table = $('<table/>');
                                table.append('<tr><th>שם אתר</th><th>כתובת</th><th>סטטוס</th><th>סוג אתר</th><th>מרחק במטרים</th></tr>');
                                for (var i = 0; i < Math.min(3, rows.length); i++) {
                                    table.append(rows[i]);
                                }
                                $('#env-app').append(table);
                            } else {
                                var message = $('<h2 class="green-text"/>').text(' ');
                                $('#env-app').append(message);
                            }
                        }).catch(function () {
                            alert("אנא נסו יותר מאוחר");
                            document.getElementById('loading').style.display = 'none';
                        });
                    });
                });
                searchClinics();
                document.getElementById('loading').style.display = 'block';
            }).catch(function () {
                alert("אנא נסו יותר מאוחר");
                document.getElementById('loading').style.display = 'none';
            });
        }
    $('#address').on('click', function () { clearFields('address'); });
    $('#lotParcel').on('click', function () { clearFields('lotParcel'); });
    $('#env-send').on('click', showExample);
})(jQuery);
