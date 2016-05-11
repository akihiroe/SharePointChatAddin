<%-- 次の 4 行は、SharePoint コンポーネントの使用時に必要な ASP.NET ディレクティブです --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- 次の Content 要素内のマークアップとスクリプトはページの <head> 内に配置されます --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <SharePoint:ScriptLink name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <meta name="WebPartPageExpansion" content="full" />

    <!-- 次のファイルに CSS スタイルを追加します -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- 次のファイルに JavaScript を追加します -->
    <script type="text/javascript" src="../Scripts/App-in.js"></script>
</asp:Content>

<%-- 次の Content 要素内のマークアップはページの TitleArea 内に配置されます --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Chat Room
</asp:Content>

<%-- 次の Content 要素内のマークアップとスクリプトはページの <body> 内に配置されます --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <div id="navigation-area">
        <div><p>
            <asp:HyperLink runat="server" 
            NavigateUrl="JavaScript:window.location = _spPageContextInfo.webAbsoluteUrl + '/Lists/Chat/AllItems.aspx';" 
            Text="掲示板の管理" />
        </p></div>

        <p>ディスカッション</p>
        <ul id="discussion-items">

        </ul>

    </div>
    <div id="main-area">
        <table id="discussion-messages">
            <tbody>

            </tbody>
            <tfoot>
                <tr><td></td><td>
                    <div id="input-message-area" style="display:none;">
                        <textarea rows="5" cols="10" id="input-message" ></textarea>
                        <input id="send-message" type="button" value="送信" />
                    </div>
                </td><td></td></tr>
            </tfoot>
        </table>
    </div>

<script type="text/javascript">

</script>
</asp:Content>
