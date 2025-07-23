using System;
using System.Collections.Generic;
using Newtonsoft.Json;

public class CPHInline
{
	public bool Execute()
	{
		Dictionary<string, object> message = new Dictionary<string, object>();
		Dictionary<string, object> content = new Dictionary<string, object>();
		
		message.Add("origin",args.ContainsKey("wsOrigin") ? args["wsOrigin"].ToString() : "antarex-overlay");
		message.Add("action",args.ContainsKey("wsAction") ? args["wsAction"].ToString() : "none");

		if (args.ContainsKey("wsType"))   message.Add("type",args["wsType"].ToString());
		if (args.ContainsKey("user"))     message.Add("user",args["user"].ToString());
		if (args.ContainsKey("userName")) message.Add("username",args["userName"].ToString());
		if (args.ContainsKey("userId")) message.Add("userid",args["userId"].ToString());
		if (args.ContainsKey("message"))  message.Add("message",args["message"].ToString());

		if (args.ContainsKey("wsParam1")) message.Add("param1",args["wsParam1"]);
		if (args.ContainsKey("wsParam2")) message.Add("param2",args["wsParam2"]);
		if (args.ContainsKey("wsParam3")) message.Add("param3",args["wsParam3"]);
		if (args.ContainsKey("wsParam4")) message.Add("param4",args["wsParam4"]);
		if (args.ContainsKey("wsParam5")) message.Add("param5",args["wsParam5"]);
		
		var jsonMessage = JsonConvert.SerializeObject(message);
		CPH.WebsocketBroadcastJson(jsonMessage);
		return true;
	}
}
