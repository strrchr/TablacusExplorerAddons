﻿var Addon_Id = "favorites";
var Default = "ToolBar2Left";

if (window.Addon == 1) {
	Addons.Favorites =
	{
		Exec: function (Ctrl, pt)
		{
			var FV = GetFolderView(Ctrl, pt);
			if (FV) {
				if (!pt) {
					var pt = api.Memory("POINT");
					if (Ctrl.offsetHeight) {
						pt = GetPos(Ctrl, 9);
					} else {
						api.GetCursorPos(pt);
					}
				}
				FV.Focus();
				ExecMenu(te, "Favorites", pt, 0);
			}
			return S_OK;
		}
	};

	var item = GetAddonElement(Addon_Id);
	Addons.Favorites.strName = item.getAttribute("MenuName") || GetText("Favorites");
	//Menu
	if (item.getAttribute("MenuExec")) {
		Addons.Favorites.nPos = api.LowPart(item.getAttribute("MenuPos"));
		AddEvent(item.getAttribute("Menu"), function (Ctrl, hMenu, nPos)
		{
			api.InsertMenu(hMenu, Addons.Favorites.nPos, MF_BYPOSITION | MF_STRING, ++nPos, GetText(Addons.Favorites.strName));
			ExtraMenuCommand[nPos] = Addons.Favorites.Exec;
			return nPos;
		});
	}
	//Key
	if (item.getAttribute("KeyExec")) {
		SetKeyExec(item.getAttribute("KeyOn"), item.getAttribute("Key"), Addons.Favorites.Exec, "Func");
	}
	//Mouse
	if (item.getAttribute("MouseExec")) {
		SetGestureExec(item.getAttribute("MouseOn"), item.getAttribute("Mouse"), Addons.Favorites.Exec, "Func");
	}
	var h = GetAddonOption(Addon_Id, "IconSize") || window.IconSize || 24;
	var src = GetAddonOption(Addon_Id, "Icon") || (h <= 16 ? "bitmap:ieframe.dll,216,16,2" : "bitmap:ieframe.dll,214,24,2");
	SetAddon(Addon_Id, Default, ['<span class="button" onclick="Addons.Favorites.Exec(this);" onmouseover="MouseOver(this)" onmouseout="MouseOut()"><img title="', Addons.Favorites.strName.replace(/"/g, ""), '" src="', src, '" width="', h, 'px" height="', h, 'px"></span>']);
} else {
	EnableInner();
}
