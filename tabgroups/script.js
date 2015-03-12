﻿var Addon_Id = "tabgroups";
var Default = "ToolBar5Center";

if (window.Addon == 1) {
	Addons.Tabgroups =
	{
		Name: null,
		Index: 1,
		Click: 0,
		nDrag: 0,
		nDrop: 0,
		WheelButton: 0,
		tid: null,
		pt: api.Memory("POINT"),

		Init: function ()
		{
			var s = []
			s.push('<span id="tabgroups">tabgroups</span>');
			s.push('<input type="button" class="tab2" value="+" title="' + GetText("New Tab") + '" onclick="return Addons.Tabgroups.Add()" hidefocus="true">');
			SetAddon(Addon_Id, Default, s.join(""));
			this.Name = [''];
			this.Color = [''];
			xml = OpenXml("tabgroups.xml", true, true);
			var items = xml.getElementsByTagName('Item');
			for (i = 0; i < items.length; i++) {
				this.Name.push(items[i].getAttribute("Name"));
				this.Color.push(items[i].getAttribute("Color"));
			}
			items = xml.getElementsByTagName('Index');
			if (items.length) {
				this.Click = items[0].text;
			}
			this.Arrange();
		},

		Save: function ()
		{
			var xml = CreateXml();
			var root = xml.createElement("TablacusExplorer");
			for (var i = 1; i < Addons.Tabgroups.Name.length; i++) {
				var item = xml.createElement("Item");
				item.setAttribute("Name", Addons.Tabgroups.Name[i]);
				item.setAttribute("Color", Addons.Tabgroups.Color[i] || "");
				root.appendChild(item);
			}
			var item = xml.createElement("Index");
			item.text = Addons.Tabgroups.Index;
			root.appendChild(item);
			xml.appendChild(root);
			SaveXmlEx("tabgroups.xml", xml, true);
		},

		Arrange: function ()
		{
			this.Fix();
			var s = [];
			for (var i = 1; i < this.Name.length; i++) {
				this.Tab(s, i);
			}
			document.getElementById("tabgroups").innerHTML = s.join("");
			this.Change();
		},

		Tab: function (s, i)
		{
			s.push('<input type="button" style="');
			var cl = this.Color[i];
			if (cl) {
				if (i == this.Index) {
					s.push("background-color:", cl, ";");
				}
				else if (document.documentMode >= 10) {
					s.push('background: linear-gradient(to bottom, #ffffff,', cl, ' 70%);');
				}
				else {
					s.push('filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0,startcolorstr=#ffffff,endcolorstr=', cl, ');');
				}
				cl = api.sscanf(cl, "#%06x") 
				cl = (cl & 0xff0000) * .0045623779296875 + (cl & 0xff00) * 2.29296875 + (cl & 0xff) * 114;
				s.push(cl > 127000 ? "color: black;" : "color: white;");
			}
			s.push('font-family: ' + document.body.style.fontFamily + '" value="' + this.Name[i]);
			s.push('" id="tabgroups' + i);
			s.push('" onmousedown="return Addons.Tabgroups.Down(this)" onmouseup="return Addons.Tabgroups.Up(this)"');
			s.push(' onmousemove="Addons.Tabgroups.Move(this)"');
			s.push(' oncontextmenu="return Addons.Tabgroups.Popup(this)" onmousewheel="Addons.Tabgroups.Wheel()"');
			s.push(' ondblclick="return Addons.Tabgroups.Edit(this)"');
			s.push(' draggable="true" ondragstart="return Addons.Tabgroups.Start5(this)" ondragover="Addons.Tabgroups.Over5(this)" ondrop="Addons.Tabgroups.Drop5(this)" ondragend="Addons.Tabgroups.End5(this)"');
			s.push('class="');
			s.push(i == this.Index ? 'activetab' : i < this.Index ? 'tab' : 'tab2');
			s.push('"  hidefocus="true">');
		},

		Add: function ()
		{
			var avail = this.Name.join("\0") + "\0";
			for (var i = 1; i <= this.Name.length + 1; i++) {
				var s = GetText("Group") + i;
				if (!avail.match(s + "\0")) {
					this.Name.push(s);
					break;
				}
			}
			var s = [];
			this.Tab(s, this.Name.length - 1);
			document.getElementById("tabgroups").insertAdjacentHTML("BeforeEnd", s.join(""));
			this.Fix();
		},

		Change: function (n)
		{
			if (n > 0) {
				this.Click = n;
			}
			this.Fix();
			var nOld = this.Index;
			if (this.Click != this.Index) {
				this.Index = this.Click;
				this.Arrange();
			}
			var bDisp = false;
			var freeTC = [];
			var preTC = [];
			var cTC = te.Ctrls(CTRL_TC);
			for (var i = 0; i < cTC.length; i++) {
				var TC = cTC[i];
				if (TC.Visible) {
					preTC.push(TC);
				}
				else if (!TC.Data.Group) {
					freeTC.push(TC);
				}
				var b = TC.Data.Group == this.Index;
				TC.Visible = b;
				bDisp |= b;
			}
			if (!bDisp) {
				if (preTC.length) {
					for (var i = 0; i < preTC.length; i++) {
						var PT = preTC[i];
						var TC = this.CreateTC(freeTC, PT.Left, PT.Top, PT.Width, PT.Height, PT.Style, PT.Align, PT.TabWidth, PT.TabHeight);
						if (TC.Count == 0) {
							var FV = PT.Selected;
							if (FV) {
								var TV = FV.TreeView;
								TC.Selected.Navigate2(FV.FolderItem, SBSP_NEWBROWSER, FV.Type, FV.CurrentViewMode, FV.fFlags, FV.Options, FV.ViewFlags, FV.IconSize, TV.Align, TV.Width, TV.Style, TV.EnumFlags, TV.RootStyle, TV.Root);
							}
							else {
								TC.Selected.Navigate2(HOME_PATH, SBSP_NEWBROWSER, te.Data.View_Type, te.Data.View_ViewMode, te.Data.View_fFlags, te.Data.View_Options, te.Data.View_ViewFlags, te.Data.View_IconSize, te.Data.Tree_Align, te.Data.Tree_Width, te.Data.Tree_Style, te.Data.Tree_EnumFlags, te.Data.Tree_RootStyle, te.Data.Tree_Root);
							}
							TC.Visible = true;
						}
					}
				}
				else {
					var TC = this.CreateTC(freeTC, 0, 0, "100%", "100%", te.Data.Tab_Style, te.Data.Tab_Align, te.Data.Tab_TabWidth, te.Data.Tab_TabHeight);
					TC.Data.Group = this.Index;
					TC.Selected.Navigate2(HOME_PATH, SBSP_NEWBROWSER, te.Data.View_Type, te.Data.View_ViewMode, te.Data.View_fFlags, te.Data.View_Options, te.Data.View_ViewFlags, te.Data.View_IconSize, te.Data.Tree_Align, te.Data.Tree_Width, te.Data.Tree_Style, te.Data.Tree_EnumFlags, te.Data.Tree_RootStyle, te.Data.Tree_Root);
				}
			}
		},

		CreateTC: function (freeTC, Left, Top, Width, Height, Style, Align, TabWidth, TabHeight)
		{
			if (freeTC.length) {
				TC = freeTC.shift();
				TC.Left = Left;
				TC.Top = Top;
				TC.Width = Width;
				TC.Height = Height;
				TC.Style = Style;
				TC.Align = Align;
				TC.TabWidth = TabWidth;
				TC.TabHeight = TabHeight;
				TC.Visible = true;
			}
			else {
				TC = te.CreateCtrl(CTRL_TC, Left, Top, Width, Height, Style, Align, TabWidth, TabHeight);
			}
			TC.Data.Group = this.Index;
			return TC;
		},

		Close: function (nPos)
		{
			var cTC = te.Ctrls(CTRL_TC);
			var i = cTC.length;
			if (i > 1) {
				while (i-- > 0) {
					var TC = cTC[i];
					if (TC.Data.Group == nPos) {
						TC.Close();
					}
					else if (TC.Data.Group > nPos) {
						TC.Data.Group--;
					}
				}
			}
			this.Name.splice(nPos, 1);
			if (this.Index >= this.Name.length && this.Index > 1) {
				this.Index--;
			}
			this.Arrange();
		},

		CloseOther: function (nPos)
		{
			var cTC = te.Ctrls(CTRL_TC);
			var i = cTC.length;
			if (i > 1) {
				while (i-- > 0) {
					var TC = cTC[i];
					if (TC.Data.Group != nPos) {
						TC.Close();
					}
					else {
						TC.Data.Group = 1;
					}
				}
			}
			this.Name = ["", this.Name[nPos]];
			this.Index = 1;
			this.Arrange();
		},

		Down: function (o)
		{
			this.Click = o.id.replace(/\D/g, '') - 0;
			this.WheelButton = api.GetKeyState(VK_MBUTTON);
			if (api.GetKeyState(VK_LBUTTON) < 0) {
				api.GetCursorPos(this.pt);
				this.Change();
			}
			return true;
		},

		Up: function (o)
		{
			if (this.WheelButton < 0) {
				this.Close(o.id.replace(/\D/g, ''));
				return false;
			}
			this.Swap(o)
		},

		Swap: function (o)
		{
			if (this.nDrag && this.nDrag != this.nDrop) {
				var nDrop = o.id.replace(/\D/g, '');
				if (nDrop == this.nDrop) {
					this.nDrop = 0;
					var ar = new Array(this.Name.length);
					var j = 0;
					for (var i = 0; i < this.Name.length; i++) {
						if (j == nDrop) {
							j++;
						}
						ar[i] = (i == this.nDrag) ? nDrop : j++;
					}
					for (var i = 1; i < this.Name.length; i++) {
						this.Name[ar[i]] = document.getElementById("tabgroups" + i).value;
					}

					var cTC = te.Ctrls(CTRL_TC);
					for (var i in cTC) {
						var TC = cTC[i];
						if (TC.Data.Group >= ar.length) {
							TC.Close();
						}
						else {
							TC.Data.Group = ar[TC.Data.Group];
						}
					}
					this.Click = nDrop;
					this.Arrange();
				}
			}
			return true;
		},

		Popup: function (o)
		{
			this.Click = o.id.replace(/\D/g, '') - 0;
			var hMenu = api.CreatePopupMenu();
			var sMenu = [1, "&Edit", 5, "Color", 2, "&Close Tab", 3, "Cl&amp;ose Other Tabs", 4, "&New Tab"];
			for (var i = 0; i < sMenu.length; i += 2) {
				api.InsertMenu(hMenu, MAXINT, MF_BYPOSITION | MF_STRING, sMenu[i], GetText(sMenu[i + 1]));
			}
			api.GetCursorPos(this.pt);
			var nVerb = api.TrackPopupMenuEx(hMenu, TPM_LEFTALIGN | TPM_LEFTBUTTON | TPM_RIGHTBUTTON | TPM_RETURNCMD, this.pt.x, this.pt.y, te.hwnd, null, null);
			api.DestroyMenu(hMenu);
			switch (nVerb) {
				case 1:
					this.Edit(o);
					break
				case 2:
					this.Close(this.Click);
					break
				case 3:
					this.CloseOther(this.Click);
					break
				case 4:
					this.Add();
					break
				case 5:
					this.SetColor(o);
					break
			}
			return false;
		},

		Edit: function (o)
		{
			var s = InputDialog(GetText("Name"), this.Name[this.Click]);
			if (s) {
				o.value = this.Name[this.Click] = s;
			}
		},

		SetColor: function (o)
		{
			this.Color[this.Click] = ChooseWebColor(this.Color[this.Click]);;
			this.Arrange();
		},

		Fix: function ()
		{
			var cTC = te.Ctrls(CTRL_TC);
			for (var i in cTC) {
				var TC = cTC[i];
				if (!TC.Data.Group && TC.Visible) {
					TC.Data.Group = this.Index;
				}
			}
		},

		Move: function (o)
		{
			if (api.GetKeyState(VK_LBUTTON) < 0) {
				this.nDrop = o.id.replace(/\D/g, '') - 0;
				if (!this.nDrag) {
					var pt = api.Memory("POINT");
					api.GetCursorPos(pt);
					if (IsDrag(pt, Addons.Tabgroups.pt)) {
						this.nDrag = this.nDrop;
						this.Cursor("move");
					}
				}
			}
			else if (this.nDrag) {
				this.Cursor("auto");
				this.nDrag = 0;
			}
		},

		Cursor: function (s)
		{
			for (var i = this.Name.length; i-- > 0;) {
				var o = document.getElementById('tabgroups' + i);
				if (o) {
					o.style.cursor = s;
				}
			}
		},

		Over: function ()
		{
			clearTimeout(Addons.Tabgroups.tid);
			Addons.Tabgroups.tid = null;
			var pt = api.Memory("POINT");
			api.GetCursorPos(pt);
			if (!Addons.Tabgroups.Drag5 && !IsDrag(pt, Addons.Tabgroups.pt)) {
				Addons.Tabgroups.Change(Addons.Tabgroups.FromPt(pt));
			}
		},

		Start5: function (o)
		{
			event.dataTransfer.effectAllowed = 'move';
			this.Drag5 = o.id;
			return api.GetKeyState(VK_LBUTTON) < 0;
		},

		End5: function (o)
		{
			this.Drag5 = null;
		},

		Over5: function (o)
		{
			if (this.Drag5) {
				if (event.preventDefault) {
					event.preventDefault();
				}
				else {
		 			event.returnValue = false;
				}
			}
		},

		Drop5: function (o)
		{
			if (/^tabgroups(\d+)/.test(o.id)) {
				this.nDrop = RegExp.$1;
				if (/^tabgroups(\d+)/.test(this.Drag5)) {
					this.nDrag = RegExp.$1;
					this.Swap(o);
				}
			}
		},

		Wheel: function ()
		{
			this.Click = this.Click - event.wheelDelta / 120
			if (this.Click < 1) {
				this.Click = this.Name.length - 1;
			}
			if (this.Click >= this.Name.length) {
				this.Click = 1;
			}
			this.Change();
		},

		FromPt: function (pt)
		{
			for (var n = this.Name.length; n-- > 0;) {
				if (HitTest(document.getElementById("tabgroups" + n), pt)) {
					return n;
				}
			}
			return -1;
		}

	};

	Addons.Tabgroups.Init();

	AddEventEx(window, "load", function ()
	{
		setTimeout("Addons.Tabgroups.Change();", 500);
	});

	AddEvent("Finalize", Addons.Tabgroups.Save);

	AddEvent("DragEnter", function (Ctrl, dataObj, grfKeyState, pt, pdwEffect)
	{
		if (Ctrl.Type == CTRL_WB) {
			return S_OK;
		}
	});

	AddEvent("DragOver", function (Ctrl, dataObj, grfKeyState, pt, pdwEffect)
	{
		if (Ctrl.Type == CTRL_WB) {
			var i = Addons.Tabgroups.FromPt(pt);
			if (i >= 0) { 
				if (i != Addons.Tabgroups.Index) {
					if (IsDrag(pt, Addons.Tabgroups.pt)) {
						clearTimeout(Addons.Tabgroups.tid);
						Addons.Tabgroups.pt = pt.Clone();
						Addons.Tabgroups.tid = setTimeout(Addons.Tabgroups.Over, 300);
					}
				}
				if (te.Data.DragTab) {
					pdwEffect.x = DROPEFFECT_LINK;
				}
				return S_OK;
			}
		}
	});

	AddEvent("Drop", function (Ctrl, dataObj, grfKeyState, pt, pdwEffect)
	{
		if (Ctrl.Type == CTRL_WB) {
			if (te.Data.DragTab) {
				Addons.Tabgroups.Over();
				var TC = te.Ctrl(CTRL_TC);
				te.Data.DragTab.Move(te.Data.DragIndex, TC.Count, TC);
				TC.SelectedIndex = TC.Count - 1;
				return S_OK;
			}
		}
	});

	AddEvent("Dragleave", function (Ctrl)
	{
		clearTimeout(Addons.Tabgroups.tid);
		Addons.Tabgroups.tid = null;
	});
}
