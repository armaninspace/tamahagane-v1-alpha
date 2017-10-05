args <- commandArgs(trailingOnly = TRUE)

suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(RJSONIO))
suppressPackageStartupMessages(library(plotly))
suppressPackageStartupMessages(library(dplyr))

# random number set
set.seed(1776)

# inbound contract check
inboundContractCheck <- list()

t <- list(
  family = "sans serif",
  size = 11)

GetDataFrame <- function(csvPath, filesType = "csv") {
  
  tryCatch({
    
    df <- fread(input = csvPath,
                header = T,
                sep = ',',
                na.strings = c("", "NA"),
                stringsAsFactors = TRUE,
                encoding = "Latin-1")
    
    df <- as.data.frame(df)
    # keep only complete rows
    complete.rows <- complete.cases(df)
    df <- df[complete.rows,]
    df
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_reading_csv" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_reading_csv" = err))
  }) # End tryCatch
  
}


# coerce data types
convert.magic <- function(obj, types) {
  
  tryCatch({
    
    for (i in 1:length(obj)){
      FUN <- switch(types[i],character = as.character, 
                    numeric = as.numeric, 
                    factor = as.factor,
                    integer = as.integer,
                    logical = as.logical)
      obj[,i] <- FUN(obj[,i])
    }
    obj
    
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_coerce" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_coerce" = err))
  }) # End tryCatch
  
}


#linear regression plots
RegressionPlots <- function(fit){
  
  # Extract fitted values from lm() object
  Fitted.Values <-  fitted(fit)
  
  # Extract residuals from lm() object
  Residuals <-  resid(fit)
  
  # Extract standardized residuals from lm() object
  Standardized.Residuals <- MASS::stdres(fit)  
  
  # Extract fitted values for lm() object
  Theoretical.Quantiles <- qqnorm(Residuals, plot.it = F)$x
  
  # Square root of abs(residuals)
  Root.Residuals <- sqrt(abs(Standardized.Residuals))
  
  # Calculate Leverage
  Leverage <- lm.influence(fit)$hat
  
  # Create data frame 
  # Will be used as input to plot_ly
  
  regMat <- data.frame(Fitted.Values, 
                       Residuals, 
                       Standardized.Residuals, 
                       Theoretical.Quantiles,
                       Root.Residuals,
                       Leverage)
  
  # Plot using Plotly
  
  # Fitted vs Residuals
  # For scatter plot smoother
  LOESS1 <- loess.smooth(Fitted.Values, Residuals)
  
  plt1 <- regMat %>% 
    plot_ly(x = Fitted.Values, y = Residuals, 
            type = "scatter", mode = "markers", hoverinfo = "x+y", name = "Data",
            marker = list(size = 10, opacity = 0.5), showlegend = F) %>% 
    
    add_trace(x = LOESS1$x, y = LOESS1$y, type = "scatter", mode = "lines+markers", name = "Smooth",
              line = list(width = 2), marker = list(size=1))%>% 
    
    layout(xaxis = list(title = "Fitted.Values"), yaxis = list(title = "Residuals"), title = "Residuals vs Fitted Values", font=t, plot_bgcolor = "#e6e6e6")
  # 
  # QQ Pot
  plt2 <- regMat %>%
    plot_ly(x = Theoretical.Quantiles, y = Standardized.Residuals,
            type = "scatter", mode = "markers", hoverinfo = "x+y", name = "Data",
            marker = list(size = 10, opacity = 0.5), showlegend = F) %>%

    add_trace(x = Theoretical.Quantiles, y = Theoretical.Quantiles, type = "scatter", mode = "lines+markers", name = "",
              line = list(width = 2), marker = list(size=1)) %>%

    layout(xaxis = list(title = "Theoretical.Quantiles"), yaxis = list(title = "Standardized.Residuals"), title = "Q-Q Plot", font=t, plot_bgcolor = "#e6e6e6")

  # Scale Location
  # For scatter plot smoother
  LOESS2 <- loess.smooth(Fitted.Values, Root.Residuals)

  plt3 <- regMat %>%
    plot_ly(x = Fitted.Values, y = Root.Residuals,
            type = "scatter", mode = "markers", hoverinfo = "x+y", name = "Data",
            marker = list(size = 10, opacity = 0.5), showlegend = F) %>%

    add_trace(x = LOESS2$x, y = LOESS2$y, type = "scatter", mode = "lines+markers", name = "Smooth",
              line = list(width = 2), marker = list(size=1)) %>%

    layout(xaxis = list(title = "Fitted.Values"), yaxis = list(title = "Root.Residuals"), title = "Scale Location", font=t, plot_bgcolor = "#e6e6e6")

  # Residuals vs Leverage
  # For scatter plot smoother
  LOESS3 <- loess.smooth(Leverage, Residuals)

  plt4 <- regMat %>%
    plot_ly(x = Leverage, y = Residuals,
            type = "scatter", mode = "markers", hoverinfo = "x+y", name = "Data",
            marker = list(size = 10, opacity = 0.5), showlegend = F) %>%

    add_trace(x = LOESS3$x, y = LOESS3$y, type = "scatter", mode = "lines+markers", name = "Smooth",
              line = list(width = 2), marker = list(size=1)) %>%

    layout(xaxis = list(title = "Leverage"), yaxis = list(title = "Residuals"), title = "Leverage vs Residuals", font=t, plot_bgcolor = "#e6e6e6")
  
  plt = list(plt1, plt2, plt3, plt4)
  return(plt)
}



json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)

csvPath     <- chartOptions$csv_path
plotpath1   <- chartOptions$plot_path1
plotpath2   <- chartOptions$plot_path2
plotpath3   <- chartOptions$plot_path3
plotpath4   <- chartOptions$plot_path4
yCol        <- chartOptions$outcome
ycoltype    <- chartOptions$outcome_type
colNames    <- chartOptions$predictors
colNames    <- strsplit(colNames,",")
colTypes    <- chartOptions$predictors_cols_types
colTypes    <- strsplit(colTypes,",")
chartTitle  <- chartOptions$chart_title


chartTitle <- ifelse(is.null(chartTitle), "Linear Regression", chartTitle)



f <- list(
  family = "Courier New, monospace",
  size = 18,
  color = "#7f7f7f"
)


predictors <- c()
for (colName in colNames[[1]]) {

  predictors <- append(predictors, colName)
}

customFormula <- as.formula(paste(yCol, "~",paste(predictors,collapse="+")))


# make vector of columns coerse types
colsTypeCoerse <- c()
for (colType in colTypes[[1]]) {

  colsTypeCoerse <- append(colsTypeCoerse, colType)
}
colsTypeCoerse <- append(colsTypeCoerse, ycoltype)



# check if required number of arguments are available.
if (length(chartOptions) < 5) {
  inboundContractCheck <- append(inboundContractCheck,
                                 list("required_args_int" = 5))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("Required arguments limit not meet.")
}

# get data frame from CSV
csvLoadTimeElapsed <- system.time(df <- GetDataFrame(paste0(csvPath)))

if(!is.data.frame(df)){
     toJSON(df)
 }else{


# check if csv load successfully or stop execution
if(length(inboundContractCheck[['error_reading_csv']]) > 0) {
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("error reading csv.")
}

# log csv load time
inboundContractCheck <- append(inboundContractCheck,
                               list("csv_load_time_elapsed" =
                                      csvLoadTimeElapsed[['elapsed']]))

# log if csv loaded successfully
if(nrow(df) > 0) {
  inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = TRUE))
  inboundContractCheck <- append(inboundContractCheck, list("csv_number_of_rows" = nrow(df)))
} else {
  inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = FALSE))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("CSV not loaded successfully.")
}

if(length(chartOptions$filters) > 0) {

  # generate a string of all filters
  filterStr <- ""
  filterContainsList <- list()
  for (i in seq_along(chartOptions$filters)) {

    colname <- chartOptions$filters[[i]][["colname"]]
    operator <- chartOptions$filters[[i]][["operator"]]
    required_val <- chartOptions$filters[[i]][["required_val"]]

    if (operator == "contains") {

      filterContainsList <- append(filterContainsList,
                                   list(list(colname, required_val)))
    } else {

      required_val_modify <- ifelse(operator == "==" || operator == "!=",
                                    paste0(" '", required_val, "'"),
                                    paste0(" ", required_val))

      filterStr <- paste0(filterStr, colname, " ", operator,
                          required_val_modify, " & ")

    }
  }
  filterStr <- substr(filterStr, 1, nchar(filterStr)-3)


  # apply contains filters
  if (length(filterContainsList) > 0) {

    # apply log time
    containsFiltersTimeElapsed <- system.time(
      for (j in seq_along(filterContainsList)) {
        filterCol <- filterContainsList[[j]][[1]]
        filterVal <- filterContainsList[[j]][[2]]

        retriveTrues <- grepl(pattern = filterVal, x = df[, filterCol],
                              ignore.case = TRUE)
        df <- df[retriveTrues, ]
      })

    # log contains Filters Time
    inboundContractCheck <- append(inboundContractCheck,
                                   list("contains_fillters_time_elapsed" =
                                          containsFiltersTimeElapsed[['elapsed']]))

    # log if DF have observations after contains filters
    if(nrow(df) > 0) {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter" = TRUE))
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter_int" = nrow(df)))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter" = FALSE))
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("No rows left after applying contains filters.")
    }
  }


  # apply numeric filters
  if (nchar(filterStr) > 0) {

    # apply log time
    numericFiltersTimeElapsed <- system.time(
      dfFiltered <- df %>%
        filter_(filterStr))

    # select desired columns
    for (variable in colNames) {

      dfFiltered <- dfFiltered[c(variable, yCol)]
    }

    # log contains Filters Time
    inboundContractCheck <- append(inboundContractCheck,
                                   list("numeric_fillters_time_elapsed" =
                                          numericFiltersTimeElapsed[['elapsed']]))

    # log if DF have observations after numeric filters
    if(nrow(dfFiltered) > 0) {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter" = TRUE))
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter_int" = nrow(dfFiltered)))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter" = FALSE))
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("No rows left after applying numeric filters.")
    }

  } else {
    # select desired columns
    for (variable in colNames) {

      dfFiltered <- df[c(variable, yCol)]
    }
  }

  # coerce types
  coerceTimeElapsed <- system.time(
    dfFiltered <- convert.magic(dfFiltered, colsTypeCoerse)
  )

  # check if coerce columns successfull or stop execution
  if(length(inboundContractCheck[['error_coerce']]) > 0) {
    inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    print(toJSON(inboundContractCheck))
    stop("error coerce columns")
  }

  # log coerce time
  inboundContractCheck <- append(inboundContractCheck,
                                 list("coerce_time_elapsed" =
                                        coerceTimeElapsed[['elapsed']]))

  if (nrow(dfFiltered) > 0) {

    # select desired columns
    for (variable in colNames) {

      selectedColsDF <- df[c(variable, yCol)]
    }

    fit = lm(customFormula, data = selectedColsDF)

    summaryobj <- list()

    summaryobj$res <- summary(summary(fit)$residuals)
    summaryobj$coef <- summary(summary(fit)$coefficients)
    summaryobj$rse <- round(summary(fit)$sigma,3)
    summaryobj$rse <- paste(summaryobj$rse,"on",summary(fit)$fstatistic[[3]],"of freedom")
    summaryobj$Fstatistic <- summary(fit)$fstatistic[[1]]
    summaryobj$Fstatistic <- paste(summaryobj$Fstatistic,"on",summary(fit)$fstatistic[[2]])

    summaryobj$rsquared <- round(summary(fit)$r.squared,4)
    summaryobj$ajstrsquared <- round(summary(fit)$adj.r.squared,4)
    #summaryJson <- toJSON(summaryobj)

    outputWarning = FALSE
    outputError = FALSE
    tryCatch({

      result <- try(
        chartGenerateTimeElapsed <- system.time (

          plt <- RegressionPlots(fit)
        )
        , silent = TRUE)


      # Process any error messages
      if (class(result) == "try-error") {
        # Ignore warnings while processing errors
        options(warn = -1)

        # set output message to error
        outputError = TRUE

        # If this script were a function, warning() and stop()
        # could be called to pass errors upstream
        msg <- geterrmessage()
        inboundContractCheck <- append(inboundContractCheck, list("chart_generating_error" = msg))

        # Restore default warning reporting
        options(warn=0)
      } else {

        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(plt[[1]], plotpath1, selfcontained = FALSE)),
          silent = TRUE)
        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(plt[[2]], plotpath2, selfcontained = FALSE)),
          silent = TRUE)
        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(plt[[3]], plotpath3, selfcontained = FALSE)),
          silent = TRUE)
        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(plt[[4]], plotpath4, selfcontained = FALSE)),
          silent = TRUE)

        inboundContractCheck <- append(inboundContractCheck, list("summaryobj" = summaryobj))


        # Process any error messages
        if (class(outputResult) == "try-error") {
          # Ignore warnings while processing errors
          options(warn = -1)

          # set output message to error
          outputError = TRUE

          # If this script were a function, warning() and stop()
          # could be called to pass errors upstream
          msg <- geterrmessage()
          inboundContractCheck <- append(inboundContractCheck, list("output_error" = msg))

          # Restore default warning reporting
          options(warn=0)
        }

        # log chart generate time
        inboundContractCheck <- append(inboundContractCheck,
                                       list("chart_generate_time_elapsed" =
                                              chartGenerateTimeElapsed[['elapsed']]))

        # log output time
        inboundContractCheck <- append(inboundContractCheck,
                                       list("output_time_elapsed" =
                                              outputTimeElapsed[['elapsed']]))
      }

    }, warning = function(war) {
      outputWarning = TRUE
      # warning handler picks up where warning was generated
      inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
    }, error = function(err) {
      outputError = TRUE
      # error handler picks up where error was generated
      inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))

    }) # End tryCatch

    # output generated successfully
    if(! outputError) {
      inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    }
    print(toJSON(inboundContractCheck))

  }

} else {
 
 
  # select desired columns
  for (variable in colNames) {

    dfFiltered <- df[c(variable, yCol)]
  }
  

  # coerce types
  coerceTimeElapsed <- system.time(
    dfFiltered <- convert.magic(dfFiltered, colsTypeCoerse)
  )

  #check if coerce columns successfull or stop execution
  if(length(inboundContractCheck[['error_coerce']]) > 0) {
    inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    print(toJSON(inboundContractCheck))
    stop("error coerce columns")
  }

  # log coerce time
  inboundContractCheck <- append(inboundContractCheck,
                                 list("coerce_time_elapsed" =
                                        coerceTimeElapsed[['elapsed']]))

  if (nrow(dfFiltered) > 0) {

    fit = lm(customFormula, data = dfFiltered)

    summaryobj <- list()



    summaryobj$res <- summary(summary(fit)$residuals)
    summaryobj$coef <- summary(summary(fit)$coefficients)
    summaryobj$rse <- round(summary(fit)$sigma,3)
    summaryobj$rse <- paste(summaryobj$rse,"on",summary(fit)$fstatistic[[3]],"of freedom")
    summaryobj$Fstatistic <- summary(fit)$fstatistic[[1]]
    summaryobj$Fstatistic <- paste(summaryobj$Fstatistic,"on",summary(fit)$fstatistic[[2]])

    summaryobj$rsquared <- round(summary(fit)$r.squared,4)
    summaryobj$ajstrsquared <- round(summary(fit)$adj.r.squared,4)
    #summaryJson <- toJSON(summaryobj)

    outputWarning = FALSE
    outputError = FALSE
    tryCatch({

      result <- try(
        chartGenerateTimeElapsed <- system.time (

          plt <- RegressionPlots(fit)
        )
        , silent = TRUE)


      # Process any error messages
      if (class(result) == "try-error") {
        # Ignore warnings while processing errors
        options(warn = -1)

        # set output message to error
        outputError = TRUE

        # If this script were a function, warning() and stop()
        # could be called to pass errors upstream
        msg <- geterrmessage()
        inboundContractCheck <- append(inboundContractCheck, list("chart_generating_error" = msg))

        # Restore default warning reporting
        options(warn=0)
      } else {

        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(plt[[1]], plotpath1, selfcontained = FALSE)),
          silent = TRUE)
        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(plt[[2]], plotpath2, selfcontained = FALSE)),
          silent = TRUE)
        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(plt[[3]], plotpath3, selfcontained = FALSE)),
          silent = TRUE)
        outputResult <- try(
          outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(plt[[4]], plotpath4, selfcontained = FALSE)),
          silent = TRUE)

        inboundContractCheck <- append(inboundContractCheck, list("summaryobj" = summaryobj))

        # Process any error messages
        if (class(outputResult) == "try-error") {
          # Ignore warnings while processing errors
          options(warn = -1)

          # set output message to error
          outputError = TRUE

          # If this script were a function, warning() and stop()
          # could be called to pass errors upstream
          msg <- geterrmessage()
          inboundContractCheck <- append(inboundContractCheck, list("output_error" = msg))

          # Restore default warning reporting
          options(warn=0)
        }

        # log chart generate time
        inboundContractCheck <- append(inboundContractCheck,
                                       list("chart_generate_time_elapsed" =
                                              chartGenerateTimeElapsed[['elapsed']]))

        # log output time
        inboundContractCheck <- append(inboundContractCheck,
                                       list("output_time_elapsed" =
                                              outputTimeElapsed[['elapsed']]))
      }

    }, warning = function(war) {
      outputWarning = TRUE
      # warning handler picks up where warning was generated
      inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
    }, error = function(err) {
      outputError = TRUE
      # error handler picks up where error was generated
      inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))

    }) # End tryCatch

    # output generated successfully
    if(! outputError) {
      inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    }
    print(toJSON(inboundContractCheck))

   }
}
}

objList = list()
objList <- sapply(ls(), function(x)
  objList <- x
)
inboundContractCheck <- append(inboundContractCheck, list("objList" = objList))
inboundContractCheck <- append(inboundContractCheck, list("dfFiltered" = dfFiltered))
print(toJSON(inboundContractCheck))


