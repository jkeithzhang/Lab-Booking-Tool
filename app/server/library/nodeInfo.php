<?php 

	error_reporting(E_ERROR);

	$toReturn = array();

	mysql_connect('138.120.135.41', 'root' , 'tigris');
	@mysql_select_db('nodes') or die( "Unable to select database");

	$query = "SHOW TABLES FROM nodes";

	$result = mysql_query($query);
	while($info = mysql_fetch_array($result)) {
		$table_name = $info[0];
		$toReturn[$table_name] = array();

		$queryq = "SELECT * FROM ".$table_name;

		$resultq = mysql_query($queryq);
		while($infoq = mysql_fetch_array($resultq)) {
			$cmd = $infoq['cmd'];
			$version = $infoq['version'];
			$formatted_release = 'release_'.preg_replace('/\./', '_', $version);
			$content = $infoq['content'];
			$sigs = json_decode(decodeJSON($infoq['sigs']));
			
			if(gettype($sigs) != 'NULL') {
				foreach($sigs as $index => $sig) {
					if(isset($sig->{'releases'}->{$formatted_release})) {
						$sid = $sig->{'sid'};
						foreach($sig->{'releases'}->{$formatted_release}->{'tests'} as $tid => $tObj) {
							$regex = decodeREGEX($tObj->{'regex'});
							 if (preg_match_all("/".$regex."/", $content, $matches)) {
							// $matches[100] = $regex;
								foreach($matches as $key => $match) {
									if (is_int($key)) {
										unset($matches[$key]);
									}
								}
								if (!isset($toReturn[$table_name][$sid])) $toReturn[$table_name][$sid] = array();
								$toReturn[$table_name][$sid] = $matches;
							}
						}
					}
				}
			} else {
				// 
				// We purposely stored the error msg to the cmd field if there is any
				// 
				$toReturn[$table_name]['error'] = $cmd;
			}
		}
	}
	mysql_close();		
	echo json_encode($toReturn);

	function decodeJSON($text) {
	 	
	  	$text = preg_replace('/&amp;/', "\&", $text);
	  	$text = preg_replace('/&lt;/', "\<", $text);
	  	$text = preg_replace('/&gt;/', "\>", $text);
	  	$text = preg_replace('/&quot;/', "\"", $text);
	  	$text = preg_replace('/&#039;/', "\'", $text);

	  	return $text;
	}

	function decodeREGEX($regex) {
		$regex = preg_replace('/_bs_/', "\\", $regex);
		$regex = preg_replace('/_fs_/', "/", $regex);
		$regex = preg_replace('/_space_/', " ", $regex);
		$regex = preg_replace('/_ob_/', "(", $regex);
		$regex = preg_replace('/_cb_/', ")", $regex);
		$regex = preg_replace('/_qm_/', "?", $regex);
		$regex = preg_replace('/_cl_/', ":", $regex);
		$regex = preg_replace('/_plus_/', "+", $regex);
		$regex = preg_replace('/_aob_/', "<", $regex);
		$regex = preg_replace('/_acb_/', ">", $regex);
		$regex = preg_replace('/_sob_/', "[", $regex);
		$regex = preg_replace('/_scb_/', "]", $regex);
		$regex = preg_replace('/_cob_/', "{", $regex);
		$regex = preg_replace('/_ccb_/', "}", $regex);
		$regex = preg_replace('/_dot_/', ".", $regex);
		$regex = preg_replace('/_star_/', "*", $regex);
		$regex = preg_replace('/_cma_/', ",", $regex);
		$regex = preg_replace('/_bar_/', "|", $regex);
		$regex = preg_replace('/_dq_/', "\"", $regex);
		$regex = preg_replace('/_sq_/', "'", $regex);
		$regex = preg_replace('/_dash_/', "-", $regex);

		return $regex;
	}

?>