var Addon_Id = "mainmenu";
var Default = "ToolBar1Left";

if (window.Addon == 1) { (function () {
	Addons.MainMenu =
	{
		Menu: [],
		Item: null,
		tid: null,
		bLoop: false,
		tid2: null,
		bClose: false,

		Popup: function (o)
		{
			if (typeof(o) == "string") {
				o = document.getElementById("Menu" + o);
			}

			if (!Addons.MainMenu.bClose) {
				this.Item = o;
				clearTimeout(Addons.MainMenu.tid);
				Addons.MainMenu.tid = setTimeout(function () {
					Addons.MainMenu.tid = null;
					var o = Addons.MainMenu.Item;
					var p = GetPos(o, true);
					MouseOver(o);
					window.Ctrl = te;
					Addons.MainMenu.bLoop = true;
					AddEvent("ExitMenuLoop", function () {
						Addons.MainMenu.bLoop = false;
						Addons.MainMenu.bClose = true;
						clearTimeout(Addons.MainMenu.tid2);
						Addons.MainMenu.tid2 = setTimeout("Addons.MainMenu.bClose = false;", 500);
					})
					ExecMenu2(o.id.replace(/^Menu/, ""), p.x, p.y + o.offsetHeight);
					MouseOut();
				}, 100);
			}
		}
	}

	AddEvent("MouseMessage", function (Ctrl, hwnd, msg, mouseData, pt, wHitTestCode, dwExtraInfo)
	{
		if (Addons.MainMenu.bLoop && Ctrl.Type == CTRL_TE) {
			if (msg == WM_MOUSEMOVE) {
				var Ctrl2 = te.CtrlFromPoint(pt);
				if (Ctrl2 && Ctrl2.Type == CTRL_WB && !HitTest(Addons.MainMenu.Item, pt)) {
					for (var i = 0; i < Addons.MainMenu.Menu.length; i++) {
						if (HitTest(Addons.MainMenu.Menu[i], pt)) {
							Addons.MainMenu.bClose = false;
							wsh.SendKeys("{Esc}");
							Addons.MainMenu.Popup(Addons.MainMenu.Menu[i]);
							break;
						}
					}
				}
			}
		}
	});

	// Init
	var used = {};
	var strMenus = ["&File", "&Edit", "&View", "F&avorites", "&Tools", "&Help"];
	var s = '';
	for (var i = 0; i < strMenus.length; i++) {
		var s1 = strMenus[i].replace("&", "");
		var strMenu = GetText(strMenus[i]);
		if (strMenu.match(/&(.)/)) {
			var c = RegExp.$1;
			if (!used[c]) {
				used[c] = true;
				SetKeyExec("All", "Alt+" + c, 'Addons.MainMenu.Popup("' + s1 + '");', "JScript");
			}
		}
		s += '<label class="menu" id="Menu' + s1 + '" onmousedown="Addons.MainMenu.Popup(this)" onmouseover="MouseOver(this)" onmouseout="MouseOut()">' + strMenu + '</label>';
	}
	SetAddon(Addon_Id, Default, s);
	for (var i = 0; i < strMenus.length; i++) {
		var s1 = strMenus[i].replace("&", "");
		Addons.MainMenu.Menu[i] = document.getElementById('Menu' + s1);
	}	
})();}
