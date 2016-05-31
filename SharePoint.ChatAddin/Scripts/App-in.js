'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

function initializePage()
{
    var discussionBoardTitle = "chat";
    var context = SP.ClientContext.get_current();
    var user = context.get_web().get_currentUser();
    var currentDisscussion;
    var autoLatestUpdated;
    var allDiscussionItems;

    context.load(user);
    context.executeQueryAsync();

    $(document).ready(function () {
        
        getDiscussions(discussionBoardTitle,
            function (discussionItems) {
                allDiscussionItems = discussionItems;
                var cont = $("#discussion-items");
                var listEnumerator = discussionItems.getEnumerator();
                while (listEnumerator.moveNext()) {
                    var oList = listEnumerator.get_current().get_fieldValues();
                    cont.append($("<li><a class='ms-core-listMenu-verticalBox discussion-item' href='#' data-lid='" + oList.ID + "'>" + oList.Title + "</a></li>"));
                }

            },
            function () {
                alert("getDiscussions error");
            });

        $("#discussion-items").on("click", "a.discussion-item", function () {
            currentDisscussion = $(this).data("lid");
            $("#DeltaPlaceHolderPageTitleInTitleArea").text($(this).text());
            autoLatestUpdated = null;
            $("#discussion-messages tbody").empty();
            autoUpdateMessages();
            $("#input-message-area").show();
        });

        $("#send-message").on("click", function () {
            if (!$("#input-message").val()) return;
            var discussionProperties = { Body: $("#input-message").val() };
            var currentDisccionItem

            var listEnumerator = allDiscussionItems.getEnumerator();
            while (listEnumerator.moveNext()) {
                var oList = listEnumerator.get_current().get_fieldValues();
                if (oList.ID == currentDisscussion) {
                    currentDisccionItem = listEnumerator.get_current();
                    break;
                }
            }

            createMessage(currentDisccionItem, discussionProperties,
                function () {
                    $("#input-message").val("");
                    autoUpdateMessages();
                },
                function () {
                    alert("createDiscussion error");
                });
        });

    });

    function createDiscussion(listTitle, properties, OnItemAdded, OnItemError) {
        var context = new SP.ClientContext.get_current();
        var web = context.get_web();

        var list = web.get_lists().getByTitle(listTitle);
        context.load(list);

        var discussionItem = SP.Utilities.Utility.createNewDiscussion(context, list, properties.Subject);
        for (var propName in properties) {
            if (propName == 'Subject') continue;
            discussionItem.set_item(propName, properties[propName])
        }
        discussionItem.update();
        context.load(discussionItem);

        context.executeQueryAsync(
            function () {
                OnItemAdded(discussionItem);
            },
            OnItemError
        );
    }

    function getDiscussions(listTitle, OnItemsLoaded, OnError) {
        var context = new SP.ClientContext.get_current();
        var web = context.get_web();

        var list = web.get_lists().getByTitle(listTitle);
        context.load(list);

        var qry = SP.CamlQuery.createAllFoldersQuery();
        var discussionItems = list.getItems(qry);
        context.load(discussionItems);

        context.executeQueryAsync(
            function () {
                OnItemsLoaded(discussionItems);
            },
            OnError
        );
    }

    function createMessage(discussionItem, properties, OnItemAdded, OnItemError) {
        var context = SP.ClientContext.get_current();
        var messageItem = SP.Utilities.Utility.createNewDiscussionReply(context, discussionItem);
        for (var propName in properties) {
            messageItem.set_item(propName, properties[propName])
        }
        messageItem.update();
        context.executeQueryAsync(
            function () {
                OnItemAdded(messageItem);
            },
            OnItemError
        );
    }

    function getMessages(listTitle, disscussionId, lastmodified, OnItemsLoaded, OnError) {
        var context = SP.ClientContext.get_current();
        var web = context.get_web();

        var list = web.get_lists().getByTitle(listTitle);
        context.load(list);

        var qry = createAllMessagesByDisscussionIDQuery(disscussionId, lastmodified);
        var messageItems = list.getItems(qry);
        context.load(messageItems);
        context.executeQueryAsync(
            function () {
                OnItemsLoaded(messageItems);
            },
            OnError
        );
    }

    function ISODateString(d) {
        function pad(n) { return n < 10 ? '0' + n : n }
        return d.getUTCFullYear() + '-'
             + pad(d.getUTCMonth() + 1) + '-'
             + pad(d.getUTCDate()) + 'T'
             + pad(d.getUTCHours()) + ':'
             + pad(d.getUTCMinutes()) + ':'
             + pad(d.getUTCSeconds()) + 'Z'
    }

    function createAllMessagesByDisscussionIDQuery(disscussionId, lastmodified) {
        var qry = new SP.CamlQuery;
        var viewXml;
        if (lastmodified) {
            viewXml = "<View Scope='Recursive'> \
                <Query> \
                    <Where> \
                        <And> \
                            <Eq> \
                                <FieldRef Name='ParentFolderId' /> \
                                <Value Type='Integer'>" + disscussionId + "</Value> \
                            </Eq> \
                            <Gt> \
                                <FieldRef Name='Modified' /> \
                                <Value Type='DateTime' StorageTZ='TRUE' IncludeTimeValue='TRUE'>" + ISODateString(lastmodified) + "</Value> \
                            </Gt> \
                        </And> \
                    </Where> \
                </Query> \
            </View>";
        } else {
            viewXml = "<View Scope='Recursive'> \
                <Query> \
                    <Where> \
                        <Eq> \
                            <FieldRef Name='ParentFolderId' /> \
                            <Value Type='Integer'>" + disscussionId + "</Value> \
                        </Eq> \
                    </Where> \
                </Query> \
            </View>";
        }
        qry.set_viewXml(viewXml);
        return qry;
    };

    //http://stackoverflow.com/questions/31434348/displaying-a-user-picture-in-a-sharepoint-web-part

    function getUserProfileImage(element, userID) {
        var clientContext = SP.ClientContext.get_current();
        var web = clientContext.get_web();
        var userInfoList = web.get_siteUserInfoList();
        var camlQuery = new SP.CamlQuery();

        // define the query to retrieve the given user's details
        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="ID"/><Value Type="Number">' + userID + '</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>');

        var camlResult = userInfoList.getItems(camlQuery);
        clientContext.load(camlResult);
        clientContext.executeQueryAsync(
            function(){
                var profile, title, login, email, pic, picUrl;

                // There should be only result. Get the item at index 0
                profile = camlResult.itemAt(0);
                pic = profile.get_item('Picture');
                if (pic) {
                    picUrl = pic.get_url();
                    element.append("<img src='" + picUrl +"' />");
                }
            },                       
            function(){
                alert("getUserProfileImage");
            });
    }


    function autoUpdateMessages() {
        updateMessages(currentDisscussion, autoLatestUpdated, function () {
            setTimeout(autoUpdateMessages, 5000);
        });
    }

    function createItemMessage(oList)
    {
        var msg;
        msg = "<tr class='discussion-item' data-lid='" + oList.ID + "' data-Modified='" + oList.Modified.toISOString() + "'>";

        var modified;
        var dt = oList.Modified;
        var month = dt.getMonth() + 1;
        var day = dt.getDate();
        var year = dt.getFullYear();
        var hour = dt.getHours();
        var minutes = dt.getMinutes();
        modified = month + '/' + day + '/' + year + " " + hour + ":" + minutes;

        if (oList.Author.get_email() != user.get_email()) {
            msg = msg + "<td><div class='profile-image'></div><div class='profile-name'>" + oList.Author.get_lookupValue() + "</div></td><td class='discussion-message'><div class='discussion-date-left'>" + modified + "</div><div class='left_balloon'>" + oList.Body + "</div></td><td></td>";
        } else {
            msg = msg + "<td></td><td class='discussion-message'><div class='discussion-date-right'>" + modified + "</div><div class='right_balloon'>" + oList.Body + "</div></td><td><div class='profile-image'></div><div class='profile-name'>" + oList.Author.get_lookupValue() + "</div></td>";
        }
        msg = msg + "</tr>"
        return $(msg);
    }

    function updateMessages(id, lastmodified, callback) {
        getMessages(discussionBoardTitle, id, lastmodified, 
            function (discussionMessages) {
                var cont = $("#discussion-messages tbody");
                var msg;
                var context = new SP.ClientContext.get_current();
                var listEnumerator = discussionMessages.getEnumerator();
                while (listEnumerator.moveNext()) {
                    var oList = listEnumerator.get_current().get_fieldValues();

                    var olditem= $(".discussion-item[data-lid=" + oList.ID + "]");
                    if (olditem.length > 0 && olditem.data("modified") == oList.Modified.toISOString()) {
                        continue;
                    }

                    msg = createItemMessage(oList);
                    cont.append(msg);
                    getUserProfileImage(msg.find(".profile-image"), oList.Author.get_lookupId());
                    if (!autoLatestUpdated || autoLatestUpdated < oList.Modified) {
                        autoLatestUpdated = oList.Modified;
                    }
                }
                if (msg) {
                    $("#input-message")[0].scrollIntoView();
                }
                callback();
            },
            function () {
                alert("getMessages error");
            });

    }
}

